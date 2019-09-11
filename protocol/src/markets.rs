use std::string::String;
use std::collections::HashMap;
use near_bindgen::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};

mod binary_market;
pub type BinaryMarket = binary_market::BinaryMarket;

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct Markets {
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

	pub fn get_all_markets(&self) -> &Vec<BinaryMarket> { 
		return &self.active_markets;
	}

	pub fn get_market(&mut self, id: u64) -> &mut BinaryMarket {
		return &mut self.active_markets[id as usize];
	}

	pub fn delete_market(&mut self, id: u64) -> bool {
		self.active_markets.remove(id as usize);
		return true;
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
		let mut context = get_context(5000000);
		let config = Config::default();
		testing_env!(context, config);
		let mut contract = Markets::new();
		contract.create_market(2, "will x happen by T".to_string(), Vec::new(), 123);
		let all_markets = contract.get_all_markets();
		let market = contract.get_market(0);

		// Testing binary tree
		let order_1 = market.place_order(0, 100000, 50);
		let order_2 = market.place_order(0, 100000, 50);
		let order_3 = market.place_order(0, 100000, 50);

		let order_4 = market.place_order(1, 100000, 50);
		let order_5 = market.place_order(1, 100000, 50);

		assert_eq!(market.resolute(vec![5000, 5000], true), true);

		let earnings = market.claim_earnings();

	}
}
