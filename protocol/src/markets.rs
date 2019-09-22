use std::string::String;
use std::collections::HashMap;
use near_bindgen::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};

mod binary_market;
pub type BinaryMarket = binary_market::BinaryMarket;
pub type Order = binary_market::orderbook::order::Order;

// TODO: refactor, after demo's

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct Markets {
	// TODO:Make mapping of BST for by unique market id instead of by Vec index
	active_markets: Vec<BinaryMarket>,
}


#[near_bindgen(init => new)]
impl Markets {
	pub fn new() -> Self {
		Self{
			active_markets: Vec::new(),
		}
	}

	pub fn create_market(&mut self, outcomes: u64, description: String, end_time: u64) -> bool {
		// Do some market validation
		let new_market = BinaryMarket::new(outcomes, description.to_string(), end_time);
		self.active_markets.push(new_market);
		return true;
	}

	pub fn delete_market(&mut self, id: u64) -> bool {
		self.active_markets.remove(id as usize);
		return true;
	}

	// TODO: Can't seem to fill the root order.
	pub fn place_order(&mut self, from: String, market_id: u64, outcome: u64, amount: u64, price: u64) -> bool {
		let total_price = amount * price;
		assert!(total_price as u128 <= env::attached_deposit());
		let market = &mut self.active_markets[market_id as usize];
		market.place_order(from, outcome, amount, price);
		return true;
	}

	pub fn resolute(&mut self, market_id: u64, payout: Vec<u64>, invalid: bool) -> bool {
		let market = &mut self.active_markets[market_id as usize];
		market.resolute(payout, invalid);
		return true;
	}

	pub fn claim_earnings(&mut self, market_id: u64, _for: String) -> u64 {
		let market = &mut self.active_markets[market_id as usize];
		return market.claim_earnings(_for);
	}

	pub fn get_all_markets(&self) -> &Vec<BinaryMarket> { 
		return &self.active_markets;
	}

	pub fn get_market(&self, id: u64) -> &BinaryMarket {
		return &self.active_markets[id as usize];
	}

	pub fn get_market_order(&self, market_id: usize, outcome: u64)  -> Option<&Order> {
		return  self.active_markets[market_id].orderbooks[&outcome].get_market_order();
	}

	pub fn get_sender(&self) -> String {
		return env::predecessor_account_id();
	}
}

#[cfg(feature = "env_test")]
#[cfg(test)]
mod tests {
    use super::*;
    use near_bindgen::MockedBlockchain;
    use near_bindgen::{VMContext, Config, testing_env};

	fn get_context(value: u128) -> VMContext {
		VMContext {
			current_account_id: "alice.near".to_string(),
            signer_account_id: "bob.near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol.near".to_string(),
            input: vec![],
            block_index: 0,
            account_balance: 0,
            storage_usage: 0,
            attached_deposit: value,
            prepaid_gas: 10u64.pow(9),
            random_seed: vec![0, 1, 2],
            free_of_charge: false,
            output_data_receivers: vec![],
		}
	}

    #[test]
	fn test_market_creation() {
		let mut context = get_context(500000000);
		let config = Config::default();
		testing_env!(context, config);
		let mut contract = Markets::new();
		contract.create_market(2, "will x happen by T".to_string(), 123);
		// Testing binary tree
		let order_4 = contract.place_order("alice.near".to_string(), 0, 1, 100000, 85);
		let order_1 = contract.place_order("alice.near".to_string(), 0, 0, 1000, 15);

		// let order_5 = contract.place_order(0, 1, 100000, 50);
		// let order_6 = contract.place_order(0, 1, 100000, 50);
		// let markets = contract.get_all_markets();
		// println!("{:?}", markets);

		// let yes_market_order = contract.get_market_order(0, 0); 
		// let no_market_order = contract.get_market_order(0, 1);
		// assert!(yes_market_order.is_none());
		// assert!(no_market_order.is_none());

		assert_eq!(contract.resolute(0, vec![10000, 0], false), true);
		let market = contract.get_all_markets();
		let earnings = contract.claim_earnings(0, "alice.near".to_string());
	}
}
