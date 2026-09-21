# HustleHub+ UI design contract

Lilitha wires data and click handlers only. **Do not rename these files, class names (`hh-*`), or prop names.** Dummy data lives in `src/sampleData.js` and is used when a page prop is omitted. Replace dummy data with API results; leave layout alone.

The dark **Design preview** bar in `App.jsx` is only so you can click Logged out / Client / Freelancer / Admin and see each nav. Delete that bar when AuthContext is in.

Presentational components do **not** call `fetch`, axios, or JWT helpers.

## Routes

| Path | Screen |
| --- | --- |
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/gigs` | `GigListPage` |
| `/gigs/:id` | `GigDetailPage` |
| `/gigs/mine` | `MyGigsPage` |
| `/gigs/new` | `GigCreatePage` |
| `/gigs/:id/edit` | `GigEditPage` |
| `/bookings` | `BookingsPage` |
| `/income` | `IncomePage` |
| `/admin/gigs` | `AdminGigsPage` |

## Nav by role (Layout shows/hides from `user.role`)

- Logged out: Login, Register, Browse
- Client: Browse, My bookings, Logout
- Freelancer: Browse, My gigs, New gig, Bookings, Income, Logout
- Admin: Browse, Admin gigs, Logout

## Shared components

### `Layout`
- `user`: `null` or `{ name, role }` (`client` \| `freelancer` \| `admin`)
- `onLogout()`
- `children`

### `LoginForm`
- `onSubmit({ email, password })`
- `error` (string)
- `loading` (boolean)

### `RegisterForm`
- `onSubmit({ name, email, password, role })`
- `error` (string)
- `loading` (boolean)

### `GigCard`
- `title` (string)
- `category` (string)
- `price` (number)
- `onView()`

### `GigForm`
- `initialValues`: `{ title, description, category, price }`
- `onSubmit({ title, description, category, price })`
- `error` (string)
- `loading` (boolean)
- `submitLabel` (string, optional)

### `EmptyState`
- `title` (string)
- `message` (string)
- `actionLabel` (string, optional)
- `onAction()` (optional)

### `ErrorBanner`
- `message` (string) — show this text only; never pass tokens or passwords

### `Spinner`
- `label` (string, optional)

## Pages

### `LoginPage`
- `onSubmit({ email, password })`, `error`, `loading`

### `RegisterPage`
- `onSubmit({ name, email, password, role })`, `error`, `loading`

### `GigListPage`
- `gigs`: array of `{ id, title, category, price }`
- `loading`, `error`

### `GigDetailPage`
- `gig`: `{ id, title, description, category, price, freelancerName? }`
- `onBook(gigId)` — Book button slot
- `canBook` (boolean)
- `booking` (optional `{ status }`)
- `loading`, `error`

### `GigCreatePage`
- `onSubmit({ title, description, category, price })`, `error`, `loading`

### `GigEditPage`
- `initialValues`, `onSubmit(...)`, `error`, `loading`

### `MyGigsPage`
- `gigs`, `onEdit(id)`, `onDelete(id)`, `loading`, `error`

### `BookingsPage`
- `bookings`: `{ id, gigTitle, status, amount, createdAt }`
- `role`: `client` \| `freelancer`
- `onConfirm(id)` — Confirm payment slot for clients on `pending` rows
- `loading`, `error`

### `IncomePage`
- `items`: `{ id, gigTitle, amount, createdAt }`
- `totalIncome` (number)
- `loading`, `error`

### `AdminGigsPage`
- `gigs`, `loading`, `error`

## Look

Warm paper background, ink header, terracotta buttons, Fraunces headings, Outfit body. Prices as `R 0.00`. Cards wrap to one column on small screens.
