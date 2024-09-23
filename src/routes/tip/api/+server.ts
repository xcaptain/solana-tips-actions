import { json } from '@sveltejs/kit';
import { findAssociatedTokenPda, TOKEN_PROGRAM_ADDRESS, ASSOCIATED_TOKEN_PROGRAM_ADDRESS, getTransferInstruction, identifyTokenAccount, fetchToken, getCreateAssociatedTokenInstructionAsync } from '@solana-program/token';
import { getTransferSolInstruction } from '@solana-program/system';
import { createSolanaRpc, partiallySignTransactionMessageWithSigners, address, createTransactionMessage, pipe, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstructions, devnet, getBase64EncodedWireTransaction, lamports, appendTransactionMessageInstruction, createNoopSigner, signTransactionMessageWithSigners, compileTransaction, type IInstruction } from '@solana/web3.js';

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
        icon: "https://solana-tips-actions.pages.dev/favicon.png",
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
    globalThis.isSecureContext = true;
    const amount = Number(url.searchParams.get("amount")) || 0.1;
    const body = await request.json();
    const sender = address<string>(body.account);
    const senderSigner = createNoopSigner(sender);

    const toWallet = address<string>('J7oj4QcNcPm3JP6yTLPXZfTZfmpAyb2B28J28p8n2pH6');
    const usdtMintAddress = address<string>('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
    const feeAddress = address('FDjn87xPsLiXwakFygi4uEdet568o7A22UboxrUCwu7A');

    const rpc = createSolanaRpc(devnet('https://late-small-spree.solana-devnet.quiknode.pro/21d45707a53ab78cf53d160e1ac2dc804b19f3ac'));

    // ensure pda exists
    const ixs: IInstruction[] = [];
    const [fromAccount] = await findAssociatedTokenPda({
        mint: usdtMintAddress,
        owner: sender,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }, {
        programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS
    });
    try {
        await fetchToken(rpc, fromAccount);
    } catch {
        // pda 不存在，需要帮忙创建一下
        const createPdaIx = await getCreateAssociatedTokenInstructionAsync({
            payer: senderSigner,
            ata: fromAccount,
            owner: sender,
            mint: usdtMintAddress,
        });
        ixs.push(createPdaIx);
    }

    const [toAccount] = await findAssociatedTokenPda({
        mint: usdtMintAddress,
        owner: toWallet,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }, {
        programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS
    });
    try {
        await fetchToken(rpc, toAccount);
    } catch {
        // pda 不存在，需要帮忙创建一下
        const createPdaIx = await getCreateAssociatedTokenInstructionAsync({
            payer: senderSigner,
            ata: toAccount,
            owner: toWallet,
            mint: usdtMintAddress,
        });
        ixs.push(createPdaIx);
    }

    const [feeAccount] = await findAssociatedTokenPda({
        mint: usdtMintAddress,
        owner: feeAddress,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }, {
        programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS
    });
    try {
        await fetchToken(rpc, feeAccount);
    } catch {
        // pda 不存在，需要帮忙创建一下
        const createPdaIx = await getCreateAssociatedTokenInstructionAsync({
            payer: senderSigner,
            ata: feeAccount,
            owner: feeAddress,
            mint: usdtMintAddress,
        });
        ixs.push(createPdaIx);
    }

    const usdtTransferIx1 = getTransferInstruction(
        {
            source: fromAccount,
            destination: toAccount,
            authority: sender,
            amount: amount * 10 ** 6,
            multiSigners: [senderSigner],
        }
    );
    const usdtTransferIx2 = getTransferInstruction(
        {
            source: fromAccount,
            destination: feeAccount,
            authority: sender,
            amount: 0.1 * 10 ** 6,
            multiSigners: [senderSigner],
        }
    );
    ixs.push(usdtTransferIx1, usdtTransferIx2);

    // const transferSolIx1 = getTransferSolInstruction(
    //     {
    //         amount: lamports(1_000_000_000n),
    //         destination: toWallet,
    //     }
    // )
    const { value: recentBlockhash } = await rpc
        .getLatestBlockhash()
        .send();
    const message = pipe(
        createTransactionMessage({ version: 0 }),
        tx => (setTransactionMessageFeePayer(sender, tx)),
        tx => (setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx)),
        tx => appendTransactionMessageInstructions(
            ixs, tx,
        )
        // tx => appendTransactionMessageInstructions(
        //     [
        //         getTransferSolInstruction({
        //             amount: lamports(100_000_000n),
        //             destination: toWallet,
        //             source: senderSigner,
        //         }),
        //         getTransferSolInstruction({
        //             amount: lamports(100_000_000n),
        //             destination: feeAddress,
        //             source: senderSigner,
        //         }),
        //     ], tx
        // ),
    );
    const myTx = compileTransaction(message);
    // const txb64 = Buffer.from(myTx.messageBytes).toString('base64');
    const serializedTransaction = getBase64EncodedWireTransaction(myTx);

    const payload = {
        transaction: serializedTransaction,
        message: "tips sent",
    };
    return json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
}

// async function getOrCreatePda(payer: Address<string>, mint: Address<string>, owner: Address<string>) {

// }
