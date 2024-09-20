import { json } from '@sveltejs/kit';
import { getTransferCheckedInstruction } from '@solana-program/token';
import { createSolanaRpc, partiallySignTransactionMessageWithSigners, decodeTransactionMessage, address, compileTransactionMessage, getBase64EncodedWireTransaction, createTransactionMessage, pipe, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstructions, getAddressFromPublicKey, devnet, type RpcDevnet, type SolanaRpcApiDevnet } from '@solana/web3.js';

const ACTIONS_CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids",
    "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
    "Content-Type": "application/json",
    "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "X-Action-Version": "1",
};

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
    return json({
        icon: "/static/favicon.png", // Local icon path
        title: "Tip to Joey",
        description: "Support Joey by donating USDT-DEV.",
        label: "Tip",
        links: {
            actions: [
                {
                    label: "Tip 1 USDT-DEV",
                    href: `${url.href}?amount=1`,
                },
            ],
        },
    }, {
        headers: ACTIONS_CORS_HEADERS,
    });
}

export const OPTIONS = GET;

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, request }) {
    const amount = Number(url.searchParams.get("amount")) || 0.1;
    const body = await request.json();
    const sender = address<string>(body.account);

    const toWallet = address<string>('DQe6m1yBWprrwR8SV5m4wAVhHAtaTRrBf16W8msg7Dqw');
    const usdtMintAddress = address<string>('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

    const transferIx = getTransferCheckedInstruction(
        {
            source: sender,
            mint: usdtMintAddress,
            destination: toWallet,
            authority: sender,
            amount: amount * 10 ** 6,
            decimals: 6,
        }
    );
    const transferFeeIx = getTransferCheckedInstruction(
        {
            source: sender,
            mint: usdtMintAddress,
            destination: address<string>('FDjn87xPsLiXwakFygi4uEdet568o7A22UboxrUCwu7A'),
            authority: sender,
            amount: 0.1 * 10 ** 6,
            decimals: 6,
        }
    );
    const rpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
    const {value: recentBlockhash} = await rpc
        .getLatestBlockhash()
        .send();
    const message = pipe(
        createTransactionMessage({ version: 0 }),
        tx => (setTransactionMessageFeePayer(sender, tx)),
        tx => (setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx)),
        tx => appendTransactionMessageInstructions(
            [transferIx, transferFeeIx], tx,
        ),
    );
    // const tx = compileTransactionMessage(message);
    const tx = await partiallySignTransactionMessageWithSigners(message);
    const payload = {
        transaction: Buffer.from(tx.messageBytes).toString("base64"),
        message: "transaction created",
    };
    return json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
}
