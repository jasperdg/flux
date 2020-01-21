use std::string::String;
use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use near_bindgen::{near_bindgen, env};
use serde::{Deserialize, Serialize};
use borsh::{BorshDeserialize, BorshSerialize};

pub mod orderbook;
type Order = orderbook::Order;

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct BinaryMarket {
	pub id: u64,
	pub orderbooks: BTreeMap<u64, orderbook::Orderbook>,
	pub creator: String,
	pub outcomes: u64,
	pub description: String,
	pub end_time: u64,
	pub oracle_address: String,
	pub payout_multipliers: Option<Vec<u64>>,
	pub invalid: Option<bool>,
	pub resoluted: bool,
	pub liquidity: u64
}

impl BinaryMarket {
	pub fn new(id: u64, from: String, outcomes: u64, description: String, end_time: u64) -> Self {
		Self {
			id,
			orderbooks: BTreeMap::new(),
			creator: from,
			outcomes,
			description,
			end_time, 
			oracle_address: env::current_account_id(),
			payout_multipliers: None,
			invalid: None,
			resoluted: false,
			liquidity: 0
		}
	}

	pub fn get_open_orders_for_user(&self, from: String, outcome: u64) -> Vec<Order>{
		let new_orderbook = orderbook::Orderbook::new(outcome);
		let orderbook = self.orderbooks.get(&outcome).unwrap_or(&new_orderbook);
		let open_orders = orderbook.get_open_orders_for_user(from);

		return open_orders;
	}

	pub fn get_filled_orders_for_user(&self, from: String, outcome: u64) -> Vec<Order>{
		let new_orderbook = orderbook::Orderbook::new(outcome);
		let orderbook = self.orderbooks.get(&outcome).unwrap_or(&new_orderbook);
		let filled_orders = orderbook.get_filled_orders_for_user(from);

		return filled_orders;
	}

	// Order filling and keeping track of spendages is way to complicated for now.
	pub fn place_order(&mut self, from: String, outcome: u64, shares: u64, spend: u64, price_per_share: u64) -> bool {
		assert_eq!(self.resoluted, false);
		let mut total_shares_filled = 0;
		let inverse_outcome = if outcome == 0 {1} else {0};
		let inverse_orderbook = self.orderbooks.entry(inverse_outcome).or_insert(orderbook::Orderbook::new(inverse_outcome));
		if inverse_orderbook.open_orders.len() > 0 {
			total_shares_filled = shares - inverse_orderbook.fill_matching_orders(shares, price_per_share);
		}

		self.liquidity = self.liquidity + spend;
		self.add_order(from, outcome, shares, price_per_share, total_shares_filled);
		return true;
	}

	fn add_order(&mut self, from: String, outcome: u64, shares: u64, price_per_share: u64, total_shares_filled: u64 ) {
		let empty_orderbook = orderbook::Orderbook::new(outcome);
		self.orderbooks.entry(outcome).or_insert(empty_orderbook);
		self.orderbooks.entry(outcome).and_modify(|orderbook| {
			let order = &mut orderbook.create_order(from, outcome, shares, price_per_share, total_shares_filled);
			orderbook.add_new_order(order);
		});
	}

	pub fn resolute(&mut self, payout: Vec<u64>, invalid: bool) {
		// TODO: Make sure market can only be resoluted after end time
		assert_eq!(self.resoluted, false);
		assert_eq!(env::predecessor_account_id(), self.creator);
		assert_eq!(payout.len(), 2);
		assert!(self.is_valid_payout(&payout, &invalid));
		self.payout_multipliers = Some(payout);
		self.invalid = Some(invalid);
		self.resoluted = true;
	}
	
	// Try and remove dups
	pub fn claim_earnings(&mut self, from: String) -> u64 {
		assert!(!self.payout_multipliers.is_none() && !self.invalid.is_none());		
		assert_eq!(self.resoluted, true);
		let mut claimable_amount = 0;

		for outcome in 0..self.outcomes {
			let new_orderbook = &mut orderbook::Orderbook::new(outcome);
			let orderbook = self.orderbooks.get_mut(&outcome).unwrap_or(new_orderbook);
			let (open_interest, earnings) = orderbook.get_and_delete_earnings(from.to_string(), self.invalid.unwrap());
			claimable_amount += self.calc_claimable_amount(outcome, open_interest, earnings);
		}

		return claimable_amount;
	}

	pub fn get_earnings(&self, from: String, and_claim: bool) -> u64 {
		assert!(!self.payout_multipliers.is_none() && !self.invalid.is_none());		
		assert_eq!(self.resoluted, true);

		let mut claimable_amount = 0;

		for outcome in 0..self.outcomes {
			let new_orderbook = orderbook::Orderbook::new(outcome);
			let orderbook = self.orderbooks.get(&outcome).unwrap_or(&new_orderbook);
			let (open_interest, earnings, _open_orders_to_delete, _filled_orders_to_delete) = orderbook.get_earnings(from.to_string(), and_claim, self.invalid.unwrap());
			claimable_amount += self.calc_claimable_amount(outcome, open_interest, earnings);
		}

		return claimable_amount;
	}

	fn cancel_order(&mut self, outcome: u64, order_id: &u64 ) -> bool{
		if let Entry::Occupied(mut orderbook) = self.orderbooks.entry(outcome) {
			orderbook.get_mut().remove(*order_id);
			return true;
		}
		return false;
	}

	fn calc_claimable_amount(&self, outcome: u64, open_interest: u64, potential_earnings: u64) -> u64 {
		let payout_multiplier = self.payout_multipliers.as_ref().unwrap()[outcome as usize];
		let mut earnings = 0;
		if self.invalid.unwrap() {
			earnings = potential_earnings;
		} else {
			if payout_multiplier == 0 {
				earnings = potential_earnings * payout_multiplier;
			} 
			else {
				earnings = potential_earnings;
			}
			earnings = earnings + open_interest;
		}
		return earnings;
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

