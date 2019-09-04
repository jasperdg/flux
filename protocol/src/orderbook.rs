extern crate byteorder;
use byteorder::{BigEndian, WriteBytesExt};
use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use std::panic;
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use near_bindgen::{near_bindgen, env};
use crate::order::Order;

#[near_bindgen]
#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct Orderbook {
	pub root: Option<Order>,
	pub open_orders: BTreeMap<Vec<u8>, Order>,
	pub filled_orders: BTreeMap<Vec<u8>, Order>,
	pub nonce: u64,
	pub outcome_id: u64
}

#[near_bindgen]
impl Orderbook {
	// TODO: Only return order_id
	pub fn add_new_order(&mut self, amount: u64, price: u64, amount_filled: u64) -> Order {
		let order_id = self.to_order_id();
		let outcome = self.outcome_id;
		let mut prev_id: Option<Vec<u8>> = None;
		let mut better_order_id: Option<Vec<u8>> = None;
		let mut worse_order_id: Option<Vec<u8>> = None;
		let order = &mut Order::new(env::signer_account_pk(), self.outcome_id, order_id.to_vec(), amount, price, amount_filled, prev_id, better_order_id, worse_order_id);
		if amount == amount_filled {
			return self.add_filled_order(order);
		} 
		return self.add_order(order);
	}

	pub fn add_filled_order(&mut self, order: &mut Order) -> Order {

		self.open_orders.insert(order.id.to_vec(), order.to_owned());
		return order.to_owned();
	}


	pub fn add_order(&mut self, order: &mut Order) -> Order {
		let is_first_order = self.root.is_none();

		if is_first_order {
			order.prev = None;
			self.root = Some(order.clone());
			self.open_orders.insert(order.id.to_vec(), order.clone());
			return order.to_owned();
		}

		let order_parent_id = self.descend_tree_for_parent(order.price);
		self.open_orders.entry(order_parent_id.to_vec()).and_modify(|parent_order| {
			if order.price > parent_order.price {
				parent_order.better_order_id = Some(order.id.to_vec());
			} else {
				parent_order.worse_order_id = Some(order.id.to_vec());
			}
		});
		
		order.prev = Some(order_parent_id.to_vec());
		self.open_orders.insert(order.id.to_vec(), order.clone());
		return order.to_owned();
	}

	pub fn remove(&mut self, order_id: &Vec<u8>) -> &bool {
		let mut order = self.open_orders.get(order_id).unwrap().to_owned();
		self.open_orders.remove(order_id);
		let has_parent_order_id = !order.prev.is_none();
		let has_worse_order_id = !order.worse_order_id.is_none();
		let has_better_order_id = !order.better_order_id.is_none();

		if has_parent_order_id {
			let parent_order_id = order.prev.as_ref().unwrap().to_vec();
			self.open_orders.entry(parent_order_id).and_modify(|parent_order| {
				if order_id == parent_order.worse_order_id.as_ref().unwrap_or(&Vec::new()) {
					parent_order.worse_order_id = None;
				} 
				else if order_id == parent_order.better_order_id.as_ref().unwrap_or(&Vec::new()) {
					parent_order.better_order_id = None;
				} 
				else {
					panic!("Oops: the order's parent doesn't link back to this order!")
				}
			});
		} else {
			self.root = None;
		}

		if has_worse_order_id {
			let worse_order_id = order.worse_order_id.as_ref().unwrap();
			let mut worse_order = self.open_orders.get(worse_order_id).unwrap().to_owned();
			self.add_order(&mut worse_order);
		}

		if has_better_order_id {
			let better_order_id = order.better_order_id.as_ref().unwrap();
			let mut better_order = self.open_orders.get(better_order_id).unwrap().to_owned();
			self.add_order(&mut better_order);
		}

		return &true;
	}

	fn descend_tree_for_parent(&mut self, price: u64) -> Vec<u8> {
		let root = self.root.as_ref().unwrap();
		let mut current_order_id = root.id.to_vec();
		let mut next_order_id: Option<&Vec<u8>> = self.get_next_order(&current_order_id, price);
		while !next_order_id.is_none() {
			current_order_id = next_order_id.as_ref().unwrap().to_vec();
			next_order_id = self.get_next_order(&current_order_id, price);
		}
	
		return current_order_id;
	}

	fn get_next_order(&mut self, current_order_id: &Vec<u8>, new_order_price: u64) -> Option<&Vec<u8>> {
		let current_order = self.open_orders.get(&current_order_id.to_vec()).unwrap();
		if new_order_price <= current_order.price {
			return current_order.worse_order_id.as_ref();
		} else {
			return current_order.better_order_id.as_ref();
		}
	}

	fn to_order_id(&mut self) -> Vec<u8> {
		let mut outcome = vec![];
		outcome.write_u64::<BigEndian>(self.outcome_id).unwrap();
		let mut nonce = vec![];
		nonce.write_u64::<BigEndian>(self.nonce).unwrap();
		let order_id = [outcome, nonce, env::signer_account_pk()].concat();
		self.nonce += 1;
		return order_id;
	}

	pub fn get_order_by_id(&self, id: &Vec<u8>) -> &Order {
		return self.open_orders.get(id).unwrap();
	}

	pub fn fill_matching_orders(&mut self, amount: u64, price: u64) -> u64 {
		let mut root = self.root.as_ref().unwrap();
		let mut total_filled = 0;
		let mut to_fill = amount;
		let matching_price = 100 - price; // Price of 1 set - the bid
		let mut match_optional = self.find_order_by_price(&root, matching_price);
		let mut match_exists = !match_optional.is_none();

		while match_exists && total_filled < amount {
			let matching_order_id = match_optional.unwrap();
			self.open_orders.entry(matching_order_id.to_vec()).and_modify(|matching_order| {
				println!("matching order: {:?}\n", matching_order);
				let match_amount_fillable = matching_order.amount - matching_order.amount_filled;
				if match_amount_fillable == to_fill {
					println!("1");
					total_filled += to_fill;
					matching_order.amount_filled += to_fill;
					to_fill = 0;
				}
				else if match_amount_fillable > to_fill {
					println!("2");
					total_filled += to_fill;
					matching_order.amount_filled += to_fill;
					to_fill = 0;
				}
				else {
					println!("3");
					total_filled += match_amount_fillable;
					matching_order.amount_filled += match_amount_fillable;
					to_fill -= match_amount_fillable;
				}

			});

			let matching_order_after_fill = self.open_orders.get(&matching_order_id).unwrap();
			println!("matching order after fill: {:?}\n", matching_order_after_fill);
			self.filled_orders.insert(matching_order_id.to_vec(), matching_order_after_fill.clone());
			if matching_order_after_fill.clone().amount_filled == matching_order_after_fill.clone().amount {
				assert_eq!(self.remove(&matching_order_id), &true);
			}
			root = self.root.as_ref().unwrap();
			match_optional = self.find_order_by_price(&root, price);
			match_exists = !match_optional.is_none();
		}
		return total_filled;
	}

	fn find_order_by_price(&self, mut current_order: &Order, target_price: u64) -> Option<Vec<u8>> {
		if current_order.price == target_price {
			return Some(current_order.id.to_vec());
		}
		else if current_order.price < target_price && !current_order.better_order_id.is_none() {
			let next_order_id = current_order.better_order_id.as_ref().unwrap();
			let next_order = &mut self.open_orders.get(next_order_id).unwrap();
			return self.find_order_by_price(next_order, target_price);
		} 
		else if current_order.price > target_price && !current_order.worse_order_id.is_none() {
			let next_order_id = current_order.worse_order_id.as_ref().unwrap();
			let next_order = &mut self.open_orders.get(next_order_id).unwrap();
			return self.find_order_by_price(next_order, target_price);		
		}
		return None;
	}

	pub fn get_market_order(& self, last_order: Option<&Order>) -> Order {
		let mut current_order: &Order;
		if last_order.is_none() {
			current_order = &self.root.as_ref().unwrap();
		}
		else {
			current_order = last_order.unwrap();
		}

		if current_order.better_order_id.is_none() {
			return current_order.clone();
		} else {
			let next_order_id = current_order.better_order_id.as_ref().unwrap();
			let next_order = self.open_orders.get(next_order_id).unwrap();
			return self.get_market_order(Some(next_order));
		}
	}

	pub fn new(outcome: u64) -> Orderbook {
		Orderbook {
			root: None,
			open_orders: BTreeMap::new(),
			filled_orders: BTreeMap::new(),
			nonce: 0,
			outcome_id: outcome,
		}
	}
}
