# for META token, total reward is 4,821,429
# please execute this script before Dec. 19th 1 AM UTC Time.
# ******** start of script ***********

export NEAR_ENV=mainnet
export REF_EX=v2.ref-finance.near
export REF_FARM=v2.ref-farming.near 
export META=meta-token.near
export GAS=100000000000000
export YN=0.000000000000000000000001
export ZERO24=000000000000000000000000
export OP=luciotato.near

near call $META storage_deposit '{"account_id": "'$REF_FARM'", "registration_only": true}' --accountId $OP --amount 0.1 || true

near call $META ft_transfer_call '{"receiver_id": "'$REF_FARM'", "amount": "4821429'$ZERO24'", "msg": "'$REF_EX'@1923#1"}' --account_id=$OP --amount=$YN --gas=$GAS || true

# ********* end of script *************
