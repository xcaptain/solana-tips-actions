// 生成默认的api，支持GET/POST

import { json } from '@sveltejs/kit';
import {
    ACTIONS_CORS_HEADERS,
    createPostResponse,
  } from "@solana/actions";
// import { clusterApiUrl, Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

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

/** @type {import('./$types').RequestHandler} */
// export async function POST({ url, request }) {
//     const amount = Number(url.searchParams.get("amount")) || 0.1;
//     const body = await request.json();
//     const sender = new PublicKey(body.account);
//     const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

//     const toWallet = new PublicKey('DQe6m1yBWprrwR8SV5m4wAVhHAtaTRrBf16W8msg7Dqw');
//     const usdtMintAddress = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

//     const fromTokenAccount = await getAssociatedTokenAddress(
//         usdtMintAddress,
//         sender
//     );
//     const toTokenAccount = await getAssociatedTokenAddress(
//         usdtMintAddress,
//         toWallet
//     );
//     const feeTokenAccount = await getAssociatedTokenAddress(
//         usdtMintAddress,
//         new PublicKey('FDjn87xPsLiXwakFygi4uEdet568o7A22UboxrUCwu7A')
//     );
//     const transferIx = createTransferInstruction(
//         fromTokenAccount,
//         toTokenAccount,
//         sender,
//         amount * 10 ** 6, // USDT有6位小数
//         [],
//         TOKEN_PROGRAM_ID
//     );
//     const transferFeeIx = createTransferInstruction(
//         fromTokenAccount,
//         feeTokenAccount,
//         sender,
//         0.1 * 10 ** 6, // USDT有6位小数
//         [],
//         TOKEN_PROGRAM_ID
//     );
//     let recentBlockhash = await connection
//         .getLatestBlockhash()
//         .then((res) => res.blockhash);
//     const message = new TransactionMessage({
//         payerKey: sender,
//         recentBlockhash,
//         instructions: [transferIx, transferFeeIx],
//     }).compileToV0Message();
//     const tx = new VersionedTransaction(message);

//     const payload = await createPostResponse({
//         fields: {
//             transaction: tx,
//             message: "transaction created",
//         }
//     })
//     return json(payload, {
//         headers: ACTIONS_CORS_HEADERS,
//     });
// }
