near create_account $CONTRACT_NAME --masterAccount=test.near --homeDir=.
cd ../protocol/ && RUSTFLAGS='-C link-arg=-s' cargo +nightly build --target wasm32-unknown-unknown --release && cd ../deployment/ && near deploy --accountId=$CONTRACT_NAME --homeDir=. --wasmFile=./../protocol/target/wasm32-unknown-unknown/release/flux_protocol.wasm
near call $CONTRACT_NAME create_market "{\"outcomes\": 2, \"description\": \"description\", \"end_time\": 10000}" --accountId=test.near --homeDir=.
near call $CONTRACT_NAME get_all_markets --accountId=test.near --homeDir=.
near call $CONTRACT_NAME place_order "{\"market_id\": 0, \"outcome\": 0, \"amount\": 100000, \"price\": 50}" --accountId=test.near --homeDir=.
near call $CONTRACT_NAME get_all_markets --accountId=test.near --homeDir=.