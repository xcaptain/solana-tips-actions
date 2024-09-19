import { json } from '@sveltejs/kit';
import {
    ACTIONS_CORS_HEADERS,
} from "@solana/actions";

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
