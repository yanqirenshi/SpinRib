// This is a Server Component — it can be rendered on the server, statically,
// or on the edge. It does NOT import the SpinRib wrapper directly because
// `<SpinRib />` is a Client Component (uses window/document/MutationObserver
// and receives function props that are not serializable across the boundary).
//
// Instead we render <Demo />, which is the Client Component boundary.
import { Demo } from '../components/Demo.jsx';

export default function Home() {
  return (
    <main>
      <Demo />
    </main>
  );
}
