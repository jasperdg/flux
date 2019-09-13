use std::string::String;
use std::collections::HashMap;
use near_bindgen::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::clone::Clone;
use std::time::SystemTime;

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug, Clone)]
pub struct Order {
	pub id: Vec<u8>,
	pub owner: Vec<u8>,
	pub outcome: u64,
	pub amount: u64,
	pub price: u64,
	pub amount_filled: u64,
	pub prev: Option<Vec<u8>>,
	pub better_order_id: Option<Vec<u8>>,
	pub worse_order_id: Option<Vec<u8>>,
}


impl Order {
	pub fn new(owner: Vec<u8>, outcome: u64, id: Vec<u8>, amount: u64, price: u64, amount_filled: u64, prev: Option<Vec<u8>>, better_order_id: Option<Vec<u8>>, worse_order_id: Option<Vec<u8>>) -> Self {
		Order {
			id,
			owner,
			outcome,
			amount,
			price,
			amount_filled,
			prev,
			better_order_id,
			worse_order_id,
		}
	}

	pub fn better_price_than(&self, compare_order: Order) -> bool {
		if self.price > compare_order.price {
			return true;
		} 
		return false;
	}
}
