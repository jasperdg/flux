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
	pub denominator: Vec<u8>,
	pub end_time: u64,
	pub oracle_address: Vec<u8>,
	pub payout: Option<Vec<u64>>,
	pub invalid: Option<bool>
}

#[near_bindgen(init => new)]
impl BinaryMarket {
	pub fn new(outcomes: u64, description: String, denominator: Vec<u8>, end_time: u64, oracle_address: Vec<u8>) -> Self {
		Self {
			orderbooks: BTreeMap::new(),
			order_ids_by_account_id:  BTreeMap::new(),
			orders: BTreeMap::new(),
			creator: env::signer_account_pk(),
			outcomes,
			outcome_tokens: initialize_outcome_tokens(outcomes),
			description,
			denominator,
			end_time, // in one day
			oracle_address,
			payout: None,
			invalid: None
		}
    }

	fn resolute(&mut self, payout: Vec<u64>, invalid: bool) -> bool {
		assert_eq!(env::signer_account_pk(), self.creator);
		assert_eq!(payout.len(), 2);
		assert!(self.is_valid_payout(&payout, &invalid));
		self.payout = Some(payout);
		self.invalid = Some(invalid);

		return true;
	}


	fn is_valid_payout(&self, payout: &Vec<u64>, invalid: &bool) -> bool {
		return (payout[0] == 10000 && payout[1] == 0 && invalid == &false) || (payout[0] == 0 && payout[1] == 10000 && invalid == &false) || (payout[0] == 5000 && payout[1] == 5000 && invalid == &true);
	}

	fn place_order(&mut self, outcome: u64, amount: u64, price: u64) -> Order {
		let total_cost = amount * price;
		assert!(env::attached_deposit() >= total_cost as u128);
		let mut amount_to_fill = amount;
		let inverse_outcome = if outcome == 0 {1} else {0};
		let inverse_orderbook = self.orderbooks.entry(inverse_outcome).or_insert(Orderbook::new(outcome));
		let mut total_filled = 0;
		if inverse_orderbook.open_orders.len() > 0 {
			total_filled = inverse_orderbook.fill_matching_orders(amount, price);
			println!("total filled: {:?}", total_filled);
		}
		let orderbook = self.orderbooks.entry(outcome).or_insert(Orderbook::new(outcome));
		let order = orderbook.add_new_order(amount, price, total_filled);
		return order;
	}
	
	fn cancel_order(&mut self, outcome: u64, order_id: &Vec<u8> ) -> bool{
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

	fn get_market_order(&self, outcome: u64) -> Order {
		let orderbook = self.orderbooks.get(&outcome).unwrap();
		return orderbook.get_market_order(None);
	}
	
	fn get_root(&self, outcome: u64) -> &Order {
		let orderbook = self.orderbooks.get(&outcome).unwrap();
		return orderbook.root.as_ref().unwrap();
	}

	fn get_outcome_token(&self, outcome: u64) -> &FungibleToken{
		return &self.outcome_tokens[outcome as usize];
	}

	
}

fn initialize_outcome_tokens(outcomes: u64) -> Vec<FungibleToken>{
	let mut i = 0;
	let mut outcome_tokens = Vec::new();
	while i <= outcomes {
		let mut name: String;
		if i == 0 {name = String::from("NoToken")}
		else {name = String::from("YesToken")}
		outcome_tokens.push(FungibleToken::new(1000000, name));
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
	fn test_binary_market() {
		let mut context = get_context(5000000);
		let config = Config::default();
		testing_env!(context, config);
		let mut contract = BinaryMarket::new(2, "test".to_string(), Vec::new(), 123, Vec::new());

		// Testing binary tree
		let order_1 = contract.place_order(0, 100000, 50);
		let order_2 = contract.place_order(0, 100000, 50);
		let order_3 = contract.place_order(0, 100000, 50);

		let order_4 = contract.place_order(1, 100000, 50);
		let order_5 = contract.place_order(1, 100000, 50);

	}
}


		// let order_3 = contract.place_order(0, 100000, 50);
		// context.attached_deposit = 6000000;
		// let order_4 = contract.place_order(0, 100000, 60);
		// context.attached_deposit = 1000000;
		// let order_5 = contract.place_order(0, 100000, 10);
		// context.attached_deposit = 500000;
		// let order_6 = contract.place_order(0, 100000, 5);
		// context.attached_deposit = 5000000;
		// let order_7 = contract.place_order(0, 100000, 50);
		// context.attached_deposit = 7000000;
		// let order_8 = contract.place_order(0, 100000, 70);
		// context.attached_deposit = 5500000;
		// let order_9 = contract.place_order(0, 100000, 55);

		// Testing fills on order addition.
		
		// let order_10 = contract.place_order(1, 50000, 50);
		// let order_11 = contract.place_order(1, 50000, 50);
		// let order_12 = contract.place_order(1, 200000, 50);

		// let market_order = contract.get_market_order(0);
		// assert_eq!(market_order.price, 70);

		// {
		// 	let updated_order_4 = contract.get_order(0, &order_4.id);
		// 	let updated_order_5 = contract.get_order(0, &order_5.id);
		// 	let updated_order_6 = contract.get_order(0, &order_6.id);
		// 	let updated_order_7 = contract.get_order(0, &order_7.id);
		// 	let updated_order_8 = contract.get_order(0, &order_8.id);
		// 	let updated_order_9 = contract.get_order(0, &order_9.id);
			
		// 	// Check parents
		// 	assert_eq!(updated_order_5.prev.as_ref(), None);
		// 	assert_eq!(updated_order_7.prev.as_ref().unwrap(), &updated_order_5.id);
		// 	assert_eq!(updated_order_4.prev.as_ref().unwrap(), &updated_order_7.id);
		// 	assert_eq!(updated_order_6.prev.as_ref().unwrap(), &updated_order_5.id);
		// 	assert_eq!(updated_order_8.prev.as_ref().unwrap(), &updated_order_4.id);
		// 	assert_eq!(updated_order_9.prev.as_ref().unwrap(), &updated_order_4.id);

		// 	// Check children
		// 	assert_eq!(updated_order_5.worse_order_id.as_ref().unwrap(), &order_6.id);
		// 	assert_eq!(updated_order_5.better_order_id.as_ref().unwrap(), &order_7.id);
		// 	assert_eq!(updated_order_7.better_order_id.as_ref().unwrap(), &order_4.id);
		// 	assert_eq!(updated_order_4.better_order_id.as_ref().unwrap(), &order_8.id);
		// 	assert_eq!(updated_order_4.worse_order_id.as_ref().unwrap(), &order_9.id);

		// }

		// // TODO: Check if orderbook for outcome 1 is also correct
		// let order_13 = contract.place_order(1, 200000, 50);
		// assert_eq!(contract.get_root(1).id, order_13.id);
		// assert_eq!(order_13.amount_filled, 100000);


		// let outcome_token = contract.get_outcome_token(0);
		// println!("{:#?}", outcome_token);
