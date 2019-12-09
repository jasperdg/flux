use std::string::String;
use near_bindgen::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

mod binary_market;
type BinaryMarket = binary_market::BinaryMarket;
type Order = binary_market::orderbook::order::Order;

// TODO: handle account correctly.
#[near_bindgen]
#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
struct Markets {
	creator: String,
	active_markets: BTreeMap<u64, BinaryMarket>,
	nonce: u64,

}

#[near_bindgen]
impl Markets {
	pub fn create_market(&mut self, outcomes: u64, description: String, end_time: u64) -> bool {
		// TODO: Do some market validation
		let from = env::predecessor_account_id();
		// if from == self.creator {
			let new_market = BinaryMarket::new(self.nonce, from, outcomes, description.to_string(), end_time);
			self.active_markets.insert(self.nonce, new_market);
			self.nonce = self.nonce + 1;
			return true;
		// } else {
		// 	return false;
		// }
	}

	pub fn delete_market(&mut self, id: u64) -> bool {
		let from = env::predecessor_account_id();

		if  from == self.creator {
			self.active_markets.remove(&id);
			return true;
		} else {
			return false;
		}
	}

	pub fn place_order(&mut self, market_id: u64, outcome: u64, spend: u64, price_per_share: u64) -> bool {
		let from = env::predecessor_account_id();
		let shares = (spend * 100) / price_per_share;
		assert!(env::attached_deposit() >= spend as u128);

		self.active_markets.entry(market_id).and_modify(|market| {
			market.place_order(from, outcome, shares, spend, price_per_share);
		});
		return true;
	}

	pub fn resolute(&mut self, market_id: u64, payout: Vec<u64>, invalid: bool) -> bool {
		let from = env::predecessor_account_id();
		let mut resoluted = false;
		self.active_markets.entry(market_id).and_modify(|market| {
			if market.creator == from {
				market.resolute(payout, invalid);
				resoluted = true;
			}
		});
		return resoluted;
	}

	pub fn claim_earnings(&mut self, market_id: u64) {
		let from = env::predecessor_account_id();
		self.active_markets.entry(market_id).and_modify(|market| {
			market.claim_earnings(from);
		});
	}

	pub fn get_open_orders(&self, market_id: u64, outcome: u64, from: String) -> Vec<Order> {
		let market = self.active_markets.get(&market_id).unwrap();
		return market.get_open_orders_for_user(from, outcome);
	}
	
	pub fn get_filled_orders(&self, market_id: u64, outcome: u64, from: String) -> Vec<Order> {
		let market = self.active_markets.get(&market_id).unwrap();
		return market.get_filled_orders_for_user(from, outcome);
	}

	pub fn get_earnings(&self, market_id: u64, from: String) -> u64 {
		return self.active_markets.get(&market_id).unwrap().get_earnings(from, false);	
	}

	pub fn get_owner(&self) -> &String {
		return &self.creator;
	}

	pub fn get_all_markets(&self) -> &BTreeMap<u64, BinaryMarket> { 
		return &self.active_markets;
	}

	pub fn get_market(&self, id: u64) -> &BinaryMarket {
		let market = self.active_markets.get(&id);
		return market.unwrap();
	}

	pub fn get_market_order(&self, market_id: u64, outcome: u64)  -> Option<&Order> {
		let market = self.active_markets.get(&market_id);
		return market.unwrap().orderbooks[&outcome].get_market_order();
	}

}

impl Default for Markets {
	fn default() -> Self {
		Self {
			creator: env::predecessor_account_id(),
			active_markets: BTreeMap::new(),
			nonce: 0
		}
	}
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_bindgen::MockedBlockchain;
    use near_bindgen::{VMContext, Config, testing_env};

	fn get_context(predecessor_account_id: String) -> VMContext {
		VMContext {
			current_account_id: "alice.near".to_string(),
            signer_account_id: "bob.near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id,
            input: vec![],
            block_index: 0,
            account_balance: 0,
			is_view: false,
            storage_usage: 0,
			block_timestamp: 123789,
            attached_deposit: 500000000,
            prepaid_gas: 10u64.pow(9),
            random_seed: vec![0, 1, 2],
            output_data_receivers: vec![],
		}
	}

    #[test]
	fn test_contract_creation() {
		testing_env!(get_context("carol.near".to_string()), Config::default());
		let mut contract = Markets::default(); 
	}

    #[test]
	fn test_market_creation() {
		testing_env!(get_context("carol.near".to_string()),  Config::default());
		let mut contract = Markets::default(); 
		contract.create_market(2, "Hi!".to_string(), 100010101001010);
	}


	#[test]
	fn test_claimable_amount_invalid_market() {
		testing_env!(get_context("carol.near".to_string()), Config::default());
		
		let mut contract = Markets::default(); 
		contract.create_market(2, "Hi!".to_string(), 100010101001010);
		
		contract.place_order(0, 0, 40000, 40);

		testing_env!(get_context("bob.near".to_string()), Config::default());
		contract.place_order(0, 1, 60000, 60);

		testing_env!(get_context("carol.near".to_string()), Config::default());
		contract.resolute(0, vec![5000, 5000], true);
		let carol_earnings = contract.get_earnings(0, "carol.near".to_string());
		assert_eq!(carol_earnings, 40000);
		let bob_earnings = contract.get_earnings(0, "bob.near".to_string());
		assert_eq!(bob_earnings, 60000);
	}

	#[test]
	fn test_claimable_amount_valid_market() {
		testing_env!(get_context("carol.near".to_string()), Config::default());
		
		let mut contract = Markets::default(); 
		contract.create_market(2, "Hi!".to_string(), 100010101001010);
		
		contract.place_order(0, 0, 40000, 40);

		testing_env!(get_context("bob.near".to_string()), Config::default());
		contract.place_order(0, 1, 60000, 60);

		testing_env!(get_context("carol.near".to_string()), Config::default());
		contract.resolute(0, vec![10000, 0], false);
		let carol_earnings = contract.get_earnings(0, "carol.near".to_string());
		assert_eq!(carol_earnings, 100000);
		let bob_earnings = contract.get_earnings(0, "bob.near".to_string());
		assert_eq!(bob_earnings, 0);

		println!("carol: {}, bob: {}", carol_earnings, bob_earnings);
	}


	#[test]
	fn test_get_open_orders() {
		testing_env!(get_context("carol.near".to_string()), Config::default());
		
		let mut contract = Markets::default(); 
		contract.create_market(2, "Hi!".to_string(), 100010101001010);
		
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);

		let open_orders = contract.get_open_orders(0, 0, "carol.near".to_string());
		assert_eq!(open_orders.len(), 5);
	}

	#[test]
	fn test_get_filled_orders() {
		testing_env!(get_context("carol.near".to_string()), Config::default());
		
		let mut contract = Markets::default(); 
		contract.create_market(2, "Hi!".to_string(), 100010101001010);
		
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 1, 60000, 60);

		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);
		contract.place_order(0, 0, 40000, 40);

		let open_orders = contract.get_open_orders(0, 0, "carol.near".to_string());
		let filled_orders = contract.get_filled_orders(0, 0, "carol.near".to_string());
		assert_eq!(open_orders.len(), 4);
		assert_eq!(filled_orders.len(), 1);
	}

}
