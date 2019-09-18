use std::string::String;
use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use std::time::SystemTime;
use near_bindgen::{near_bindgen, env};
use serde::{Deserialize, Serialize};
use borsh::{BorshDeserialize, BorshSerialize};

pub mod orderbook;

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct BinaryMarket {
	pub orderbooks: BTreeMap<u64, orderbook::Orderbook>,
	pub creator: String,
	pub outcomes: u64,
	pub description: String,
	pub end_time: u64,
	pub oracle_address: String,
	pub payout: Option<Vec<u64>>,
	pub invalid: Option<bool>,
	pub resoluted: bool
}

impl BinaryMarket {
	pub fn new(outcomes: u64, description: String, end_time: u64) -> Self {
		Self {
			orderbooks: BTreeMap::new(),
			creator: env::current_account_id(),
			outcomes,
			description,
			end_time, // in one day
			oracle_address: env::current_account_id(),
			payout: None,
			invalid: None,
			resoluted: false
		}
	}

	pub fn resolute(&mut self, payout: Vec<u64>, invalid: bool) -> bool {
		// TODO: Make sure market can only be resoluted after end time
		assert_eq!(self.resoluted, false);
		assert_eq!(env::current_account_id(), self.creator);
		assert_eq!(payout.len(), 2);
		assert!(self.is_valid_payout(&payout, &invalid));
		self.payout = Some(payout);
		self.invalid = Some(invalid);
		self.resoluted = true;
		return true;
	}

	pub fn claim_earnings(&mut self) -> bool {
		assert!(!self.payout.is_none() && !self.invalid.is_none());		
		assert_eq!(self.resoluted, true);
		let mut amount_owed = 0;
		for (i, orderbook) in &mut self.orderbooks {
			let money_owed_if_winning_share = orderbook.get_and_remove_owed_to_user();
			amount_owed += money_owed_if_winning_share * self.payout.as_ref().unwrap()[i.to_owned() as usize] / 10000;
		}
		
		// TODO: Transfer back the amount owed to sender
		if amount_owed > 0 {
			let promise_idx = env::promise_batch_create(env::current_account_id());
			env::promise_batch_action_transfer(promise_idx, amount_owed as u128);
			return true;
		} else {
			return false;
		}
	}

	fn is_valid_payout(&self, payout: &Vec<u64>, invalid: &bool) -> bool {
		return (payout[0] == 10000 && payout[1] == 0 && invalid == &false) || (payout[0] == 0 && payout[1] == 10000 && invalid == &false) || (payout[0] == 5000 && payout[1] == 5000 && invalid == &true);
	}

	pub fn place_order(&mut self, outcome: u64, amount: u64, price: u64) -> bool {
		assert_eq!(self.resoluted, false);
		let mut amount_to_fill = amount;
		let inverse_outcome = if outcome == 0 {1} else {0};
		let inverse_orderbook = self.orderbooks.entry(inverse_outcome).or_insert(orderbook::Orderbook::new(outcome));
		let mut total_filled = 0;
		if inverse_orderbook.get_open_orders().len() > 0 {
			total_filled = inverse_orderbook.fill_matching_orders(amount, price);
		}
		let orderbook = self.orderbooks.entry(outcome).or_insert(orderbook::Orderbook::new(outcome));
		let order = orderbook.add_new_order(amount, price, total_filled);
		return true;
	}
	
	fn cancel_order(&mut self, outcome: u64, order_id: &u64 ) -> bool{
		if let Entry::Occupied(mut orderbook) = self.orderbooks.entry(outcome) {
			orderbook.get_mut().remove(*order_id);
			return true;
		}
		return false;
	}

	fn get_order(&self, outcome: u64, order_id: &u64 ) -> &orderbook::Order {
		let orderbook = self.orderbooks.get(&outcome).unwrap();
		return orderbook.get_order_by_id(order_id);
	}

	// pub fn get_market_order(&self, outcome: u64) -> orderbook::Order {
	// 	// return self.orderbooks.get(&outcome).unwrap().get_market_order(None);
	// }
	
}
