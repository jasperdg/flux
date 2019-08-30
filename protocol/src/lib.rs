#![feature(const_vec_new)]

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[macro_use]
mod order;
mod orderbook;
mod fungible_token;
mod binary_market;