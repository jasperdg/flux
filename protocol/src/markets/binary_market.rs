use std::string::String;
use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use near_bindgen::{near_bindgen, env};
use serde::{Deserialize, Serialize};
use borsh::{BorshDeserialize, BorshSerialize};

pub mod orderbook;

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct BinaryMarket {
	pub orderbooks: BTreeMap<u64, orderbook::Orderbook>,
	pub filled_orders_by_user: BTreeMap<String, u64>,
	pub creator: String,
	pub outcomes: u64,
	pub description: String,
	pub end_time: u64,
	pub oracle_address: String,
	pub payout_multipliers: Option<Vec<u64>>,
	pub invalid: Option<bool>,
	pub resoluted: bool
}

impl BinaryMarket {
	pub fn new(outcomes: u64, description: String, end_time: u64) -> Self {
		Self {
			orderbooks: BTreeMap::new(),
			filled_orders_by_user: BTreeMap::new(),
			creator: env::current_account_id(),
			outcomes,
			description,
			end_time, // in one day
			oracle_address: env::current_account_id(),
			payout_multipliers: None,
			invalid: None,
			resoluted: false
		}
	}

	pub fn place_order(&mut self, from: String, outcome: u64, amount: u64, price: u64) -> bool {
		assert_eq!(self.resoluted, false);

		let inverse_outcome = if outcome == 0 {1} else {0};
		let inverse_orderbook = self.orderbooks.entry(inverse_outcome).or_insert(orderbook::Orderbook::new(outcome));
		let mut filled = 0;

		if inverse_orderbook.get_open_orders().len() > 0 {
			let (total_filled, match_outcome, matches_owners, matches_filled) = inverse_orderbook.fill_matching_orders(amount, price);
			if total_filled > 0 {
				self.modify_order_fills(from.to_string(), &outcome, total_filled);
				for i in 0..matches_owners.len() {
					self.modify_order_fills(matches_owners[i].to_string(), &match_outcome, matches_filled[i]);
				}
				filled = total_filled;
			}
		}
		let orderbook = self.orderbooks.entry(outcome).or_insert(orderbook::Orderbook::new(outcome));
		let order = orderbook.add_new_order(from, amount, price, filled);
		return true;
	}

	fn modify_order_fills(&mut self, from: String, outcome: &u64, total_filled: u64) {
		let user_outcome_id = self.to_user_outcome_id(from, *outcome);

		self.filled_orders_by_user.entry(user_outcome_id.to_string()).or_insert(0);
		self.filled_orders_by_user.entry(user_outcome_id).and_modify(|amount| {
			*amount += total_filled;
		});
	}
	
	fn cancel_order(&mut self, outcome: u64, order_id: &u64 ) -> bool{
		if let Entry::Occupied(mut orderbook) = self.orderbooks.entry(outcome) {
			orderbook.get_mut().remove(*order_id);
			return true;
		}
		return false;
	}

	pub fn resolute(&mut self, payout: Vec<u64>, invalid: bool) {
		// TODO: Make sure market can only be resoluted after end time
		assert_eq!(self.resoluted, false);
		assert_eq!(env::current_account_id(), self.creator);
		assert_eq!(payout.len(), 2);
		assert!(self.is_valid_payout(&payout, &invalid));
		self.payout_multipliers = Some(payout);
		self.invalid = Some(invalid);
		self.resoluted = true;
	}

	// TODO: Also claim open orders back.
	pub fn claim_earnings(&mut self, _for: String) -> u64 {
		assert!(!self.payout_multipliers.is_none() && !self.invalid.is_none());		
		assert_eq!(self.resoluted, true);
		let mut claimable_amount = 0;

		for outcome in 0..self.outcomes {
			let user_outcome_id = self.to_user_outcome_id(_for.to_string(), outcome);
			let amount = self.filled_orders_by_user.get(&user_outcome_id);
			if !amount.is_none() {
				claimable_amount += amount.unwrap() * self.payout_multipliers.as_ref().unwrap()[outcome as usize] / 100;
			}
		}
		
		if claimable_amount > 0 {
			let promise_idx = env::promise_batch_create(_for);
			env::promise_batch_action_transfer(promise_idx, claimable_amount as u128);
		} 
		return claimable_amount;
	}

	fn to_user_outcome_id(&self, user: String, outcome: u64) -> String {
		return format!("{}{}", user, outcome.to_string());
	}

	fn is_valid_payout(&self, payout_multipliers: &Vec<u64>, invalid: &bool) -> bool {
		return (payout_multipliers[0] == 10000 && payout_multipliers[1] == 0 && invalid == &false) || (payout_multipliers[0] == 0 && payout_multipliers[1] == 10000 && invalid == &false) || (payout_multipliers[0] == 5000 && payout_multipliers[1] == 5000 && invalid == &true);
	}

	fn get_order(&self, outcome: u64, order_id: &u64 ) -> &orderbook::Order {
		let orderbook = self.orderbooks.get(&outcome).unwrap();
		return orderbook.get_order_by_id(order_id);
	}
	
}
