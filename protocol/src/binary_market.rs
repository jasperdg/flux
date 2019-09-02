use std::string::String;
use std::clone::Clone;
use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use std::time::SystemTime;
use near_bindgen::{near_bindgen, env};
use serde::{Deserialize, Serialize};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::fungible_token::FungibleToken;
use crate::order::Order;
use crate::orderbook::Orderbook;

#[near_bindgen]
#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
pub struct BinaryMarket {
	pub orderbooks: BTreeMap<u64, Orderbook>,
	pub order_ids_by_account_id: BTreeMap<Vec<u8>, Vec<Vec<u8>>>,
	pub orders: BTreeMap<Vec<u8>, Order>,
	pub creator: Vec<u8>,
	pub outcomes: u64,
	pub	outcome_tokens: Vec<FungibleToken>,
	pub description: String,
	pub denominator: String,
	pub end_time: u64,
	pub oracle_contract_address: String,
}

#[near_bindgen]
impl BinaryMarket {
	fn place_order(&mut self, outcome: u64, amount: u64, price: u64) -> Order {
		let orderbook = self.orderbooks.entry(outcome).or_insert(Orderbook::new(outcome));
		let order = orderbook.add_new_order(amount, price);
		return order;
	}
	
	fn cancel_order(&mut self, outcome: u64, order_id: &Vec<u8> ) -> bool{
		// TODO: when an order is canceled or filled we need to keep track of how much money was filled for that outcome for that user to ensure 
		// invalid markets can be paid out.
		if let Entry::Occupied(mut orderbook) = self.orderbooks.entry(outcome) {
			orderbook.get_mut().remove(order_id);
			return true;
		}
		return false;
	}

	fn get_order(&self, outcome: u64, order_id: &Vec<u8> ) -> &Order {
		let orderbook = self.orderbooks.get(&outcome).unwrap();
		return orderbook.get_order_by_id(order_id);
	}


	// fn get_orders(&self) -> Option<Vec<&Order>>{
	// 	return Some(Order{})
	// }
}

impl Default for BinaryMarket {
    fn default() -> Self {
		let now = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
		let outcomes = 2;
		Self {
			orderbooks: BTreeMap::new(),
			order_ids_by_account_id:  BTreeMap::new(),
			orders: BTreeMap::new(),
			creator: env::signer_account_pk(),
			outcomes,
			outcome_tokens: initialize_outcome_tokens(outcomes),
			description: String::from("Will x happen by T?"),
			denominator: String::from("fungibletoken"),
			end_time: now.as_secs() as u64 + (60 * 60 * 24), // in one day
			oracle_contract_address: String::from("some_Ethereum_smart_contract_address"),
		}
    }
}

fn initialize_outcome_tokens(outcomes: u64) -> Vec<FungibleToken>{
	let mut i = 0;
	let mut outcome_tokens = Vec::new();
	while i <= outcomes {
		outcome_tokens.push(FungibleToken::default());
		i += 1;
	}
	return outcome_tokens;
}

#[cfg(feature = "env_test")]
#[cfg(test)]
mod tests {
    use super::*;
    use near_bindgen::MockedBlockchain;
    use near_bindgen::{VMContext, Config, testing_env};

	fn get_context() -> VMContext {
		VMContext {
			current_account_id: "alice.near".to_string(),
            signer_account_id: "bob.near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol.near".to_string(),
            input: vec![],
            block_index: 0,
            account_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(9),
            random_seed: vec![0, 1, 2],
            free_of_charge: false,
            output_data_receivers: vec![],
		}
	}

    #[test]
	fn test_binary_market() {
		let context = get_context();
		let config = Config::default();
		testing_env!(context, config);
		let mut contract = BinaryMarket::default();

		// Testing binary tree
		let order_1 = contract.place_order(0, 100, 50);
		let order_2 = contract.place_order(0, 100, 50);
		let order_3 = contract.place_order(0, 100, 50);
		let order_4 = contract.place_order(0, 100, 60);
		let order_5 = contract.place_order(0, 100, 10);
		let order_6 = contract.place_order(0, 100, 5);
		let order_7 = contract.place_order(0, 100, 50);
		let order_8 = contract.place_order(0, 100, 70);
		let order_9 = contract.place_order(0, 100, 55);

		assert_eq!(order_1.prev, None);
		assert_eq!(order_2.prev.unwrap(), order_1.id);
		assert_eq!(order_3.prev.unwrap(), order_2.id);
		assert_eq!(order_4.prev.unwrap(), order_1.id);
		assert_eq!(order_5.prev.unwrap(), order_3.id);
		assert_eq!(order_6.prev.unwrap(), order_5.id);
		assert_eq!(order_7.prev.unwrap(), order_5.id);
		assert_eq!(order_8.prev.unwrap(), order_4.id);
		assert_eq!(order_9.prev.unwrap(), order_4.id);

		{
			let updated_order_1 = contract.get_order(0, &order_1.id);
			let updated_order_2 = contract.get_order(0, &order_2.id);
			let updated_order_3 = contract.get_order(0, &order_3.id);
			let updated_order_4 = contract.get_order(0, &order_4.id);
			let updated_order_5 = contract.get_order(0, &order_5.id);
			let updated_order_6 = contract.get_order(0, &order_6.id);
			let updated_order_7 = contract.get_order(0, &order_7.id);
			let updated_order_8 = contract.get_order(0, &order_8.id);
			let updated_order_9 = contract.get_order(0, &order_9.id);

			assert_eq!(updated_order_1.worse_order_id.as_ref().unwrap(), &order_2.id);
			assert_eq!(updated_order_1.better_order_id.as_ref().unwrap(), &order_4.id);
			assert_eq!(updated_order_2.worse_order_id.as_ref().unwrap(), &order_3.id);
			assert_eq!(updated_order_3.worse_order_id.as_ref().unwrap(), &order_5.id);
			assert_eq!(updated_order_4.worse_order_id.as_ref().unwrap(), &order_9.id);
			assert_eq!(updated_order_4.better_order_id.as_ref().unwrap(), &order_8.id);
			assert_eq!(updated_order_5.worse_order_id.as_ref().unwrap(), &order_6.id);
			assert_eq!(updated_order_5.better_order_id.as_ref().unwrap(), &order_7.id);
		}


		contract.cancel_order(0, &order_1.id);
		{
			let updated_order_2 = contract.get_order(0, &order_2.id);
			assert_eq!(updated_order_2.prev, None);
		}
	}
}
