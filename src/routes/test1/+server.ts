import { text } from '@sveltejs/kit';

export function GET() {
    return text('hello world');
}
