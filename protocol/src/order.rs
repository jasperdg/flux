use borsh::{BorshDeserialize, BorshSerialize};
use std::clone::Clone;
use std::time::SystemTime;

#[derive(BorshDeserialize, BorshSerialize, Debug, Clone)]
pub struct Order {
	pub id: Vec<u8>,
	pub owner: Vec<u8>,
	pub outcome: u64,
	pub amount: u64,
	pub price: u64,
	pub amount_filled: u64,
	pub created_at: u64,
	pub prev: Option<Vec<u8>>,
	pub better_order_id: Option<Vec<u8>>,
	pub worse_order_id: Option<Vec<u8>>,
}

impl Order {
	pub fn new(owner: Vec<u8>, outcome: u64, id: Vec<u8>, amount: u64, price: u64, prev: Option<Vec<u8>>, better_order_id: Option<Vec<u8>>, worse_order_id: Option<Vec<u8>>) -> Order {
		let now = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs() as u64;

		Order {
			id,
			owner,
			outcome,
			amount,
			price,
			amount_filled: 0,
			created_at: now,
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