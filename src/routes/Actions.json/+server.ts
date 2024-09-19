import { json } from '@sveltejs/kit';

const ACTIONS_CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids",
    "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
    "Content-Type": "application/json",
};

export function GET() {
    return json({
        rules: [
            // Map all root level routes to an action
            {
                pathPattern: "/",
                apiPath: "/tip/api/",
            },
        ],
    }, {
        headers: ACTIONS_CORS_HEADERS,
    });
}

export const OPTIONS = GET;
