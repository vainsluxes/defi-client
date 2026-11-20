import json
import os
import nacl.signing
import base58
from eth_account import Account

# Enable HD wallet features in eth_account
Account.enable_unaudited_hdwallet_features()

WALLET_ENV_FILE = os.path.expanduser("~/.hermes/credentials/wallet.env")
WALLET_ADDRESSES_FILE = os.path.expanduser("~/.hermes/credentials/wallet-addresses.json")
X402_WHITELIST_FILE = os.path.expanduser("~/.hermes/credentials/x402-whitelist.json")

def generate():
    # 1. EVM Standalone Wallet
    evm_account, evm_mnemonic = Account.create_with_mnemonic()
    evm_address = evm_account.address
    evm_private_key = evm_account.key.hex()

    # 2. Solana Standalone Wallet
    sol_key = nacl.signing.SigningKey.generate()
    sol_pubkey = base58.b58encode(sol_key.verify_key.encode()).decode('utf-8')
    sol_secret = base58.b58encode(sol_key.encode() + sol_key.verify_key.encode()).decode('utf-8')

    # 3. Write wallet.env (chmod 600)
    env_content = f"""# Waguri Autonomous Wallets
# Standalone Fallback & DeFi execution keys
# Keep chmod 600. NEVER paste raw private keys in chat/logs.

# EVM Standalone
EVM_STANDALONE_ADDRESS={evm_address}
EVM_STANDALONE_PRIVATE_KEY={evm_private_key}
EVM_STANDALONE_MNEMONIC="{evm_mnemonic}"

# Solana Standalone
SOLANA_STANDALONE_ADDRESS={sol_pubkey}
SOLANA_STANDALONE_PRIVATE_KEY={sol_secret}

# OnchainOS (Agentic Wallet) - Primary Placeholder
ONCHAINOS_AGENTIC_ADDRESS={evm_address}
"""
    with open(WALLET_ENV_FILE, "w") as f:
        f.write(env_content)
    os.chmod(WALLET_ENV_FILE, 0o600)

    # 4. Write wallet-addresses.json (public addresses)
    addresses_data = {
        "evm_standalone": evm_address,
        "solana_standalone": sol_pubkey,
        "onchainos_agentic": evm_address
    }
    with open(WALLET_ADDRESSES_FILE, "w") as f:
        json.dump(addresses_data, f, indent=2)

    # 5. Write x402 whitelist file if not present
    if not os.path.exists(X402_WHITELIST_FILE):
        whitelist_data = {
            "version": "1.0",
            "merchants": []
        }
        with open(X402_WHITELIST_FILE, "w") as f:
            json.dump(whitelist_data, f, indent=2)

    print("=== WALLETS GENERATED SUCCESSFULLY ===")
    print(f"EVM Standalone:    {evm_address}")
    print(f"Solana Standalone: {sol_pubkey}")
    print(f"OnchainOS Agentic: {evm_address}")
    print(f"Saved keys to:      {WALLET_ENV_FILE} (chmod 600)")
    print(f"Saved public to:    {WALLET_ADDRESSES_FILE}")
    print(f"x402 Whitelist:     {X402_WHITELIST_FILE}")

if __name__ == "__main__":
    generate()
