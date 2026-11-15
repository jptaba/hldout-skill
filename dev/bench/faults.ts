/**
 * The benchmark's faults: what can be switched on in the application behind the proxy (proxy.ts). Each is one
 * defect a story's criteria can catch, small enough to say in a line, and wrong only while it is on. Which story
 * each one breaks, and which criterion, is in the story's key (demo/bench/keys/).
 */
import type { Fault, Req, Res } from './proxy';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * The criteria of a product listing: the web shop sends them as the JSON body of a QUERY request, other clients as
 * the query string of a GET; both reach the same listing.
 */
function listing(req: Req): { get(k: string): string | undefined; set(k: string, v: string): void } | undefined {
  if (req.path !== '/products') return undefined;
  if (req.method === 'GET') return { get: (k) => req.query.get(k) ?? undefined, set: (k, v) => req.query.set(k, v) };
  const body = req.body;
  if (req.method === 'QUERY' && isObj(body)) return { get: (k) => (body[k] == null ? undefined : String(body[k])), set: (k, v) => { body[k] = v; } };
  return undefined;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const cartItem = /^\/carts\/[^/]+$/;
const cartQuantity = /^\/carts\/[^/]+\/product\/quantity$/;
const invoice = /^\/invoices\/(?!search$)[^/]+$/;
const refuse = (field: string, text: string): Res => ({ status: 422, body: { message: text, errors: { [field]: [text] } } });

export const FAULTS: Fault[] = [
  { id: 'F01', title: 'the price range leaves out products priced exactly at its maximum', request: (req) => {
    const p = listing(req);
    const m = /^price,([\d.]+),([\d.]+)$/.exec(p?.get('between') ?? '');
    if (!p || !m) return false;
    p.set('between', `price,${m[1]},${(Math.round(Number(m[2]) * 100 - 1) / 100).toFixed(2)}`);
    return true;
  } },
  { id: 'F02', title: 'with a price range set, every page of the listing shows the first page', request: (req) => {
    const p = listing(req);
    if (!p || !p.get('between') || Number(p.get('page') ?? '1') <= 1) return false;
    p.set('page', '1');
    return true;
  } },
  { id: 'F03', title: 'sorting by price from high to low sorts from low to high', request: (req) => {
    const p = listing(req);
    if (!p || p.get('sort') !== 'price,desc') return false;
    p.set('sort', 'price,asc');
    return true;
  } },
  { id: 'F04', title: 'adding a product that is already a favourite is accepted as a new favourite', response: (req, res) => {
    if (req.method !== 'POST' || req.path !== '/favorites' || res.status !== 409 || !isObj(req.body)) return false;
    const productId = String(req.body.product_id ?? '');
    res.status = 201;
    res.body = { product_id: productId, id: productId.toLowerCase() };
    return true;
  } },
  { id: 'F05', title: 'removing a favourite is answered as done and the favourite stays', request: (req) =>
    (req.method === 'DELETE' && /^\/favorites\/[^/]+$/.test(req.path) ? { status: 204, body: null } : false) },
  { id: 'F06', title: 'a cart quantity of 99 is refused as too large', request: (req) => {
    const adds = req.method === 'POST' && cartItem.test(req.path);
    const sets = req.method === 'PUT' && cartQuantity.test(req.path);
    if (!(adds || sets) || !isObj(req.body) || Number(req.body.quantity) !== 99) return false;
    return refuse('quantity', 'The quantity field must not be greater than 98.');
  } },
  { id: 'F07', title: 'setting a cart quantity of 0 or less is accepted and stored as 1', request: (req) => {
    if (req.method !== 'PUT' || !cartQuantity.test(req.path) || !isObj(req.body)) return false;
    const q = req.body.quantity;
    if (typeof q !== 'number' && typeof q !== 'string') return false;
    if (String(q).trim() === '' || !(Number(q) <= 0)) return false;
    req.body.quantity = 1;
    return true;
  } },
  { id: 'F08', title: 'a cart with both products and rentals gets 10% discount instead of 15%', response: (req, res) => {
    if (req.method !== 'GET' || !cartItem.test(req.path) || !isObj(res.body) || res.body.additional_discount_percentage !== 15) return false;
    res.body.additional_discount_percentage = 10;
    return true;
  } },
  { id: 'F09', title: 'a contact message without a subject is refused with a message about an invalid subject', response: (req, res) => {
    if (req.method !== 'POST' || req.path !== '/messages' || res.status !== 422 || !isObj(res.body)) return false;
    const subject = res.body.subject;
    if (!Array.isArray(subject) || !subject.includes('The subject field is required.')) return false;
    res.body.subject = subject.map((s) => (s === 'The subject field is required.' ? 'The selected subject is invalid.' : s));
    return true;
  } },
  { id: 'F10', title: 'marking a contact message as resolved saves it as in progress', request: (req) => {
    if (req.method !== 'PUT' || !/^\/messages\/[^/]+\/status$/.test(req.path) || !isObj(req.body) || req.body.status !== 'RESOLVED') return false;
    req.body.status = 'IN_PROGRESS';
    return true;
  } },
  { id: 'F11', title: 'the list of contact messages is given to a visitor who is not signed in (an empty page)', request: (req) => {
    if (req.method !== 'GET' || req.path !== '/messages' || req.headers.authorization) return false;
    return { status: 200, body: { current_page: 1, data: [], from: null, last_page: 1, per_page: 15, to: null, total: 0 } };
  } },
  { id: 'F12', title: 'a bank-transfer account number containing letters passes the payment check', request: (req) => {
    if (req.method !== 'POST' || req.path !== '/payment/check' || !isObj(req.body) || req.body.payment_method !== 'bank-transfer') return false;
    const details = req.body.payment_details;
    if (!isObj(details) || typeof details.account_number !== 'string' || /^\d+$/.test(details.account_number)) return false;
    details.account_number = details.account_number.replace(/\D/g, '') || '0';
    return true;
  } },
  { id: 'F13', title: 'placing an order as a signed-in customer answers 200 instead of 201 Created', response: (req, res) => {
    if (req.method !== 'POST' || req.path !== '/invoices' || res.status !== 201) return false;
    res.status = 200;
    return true;
  } },
  { id: 'F14', title: 'an invoice\'s total leaves out its eco-friendly discount', response: (req, res) => {
    if (req.method !== 'GET' || !invoice.test(req.path) || !isObj(res.body)) return false;
    const { subtotal, additional_discount_amount: extra, eco_discount_amount: eco } = res.body;
    if (typeof subtotal !== 'number' || typeof eco !== 'number' || eco <= 0) return false;
    res.body.total = round2(subtotal - (typeof extra === 'number' ? extra : 0));
    return true;
  } },
];
