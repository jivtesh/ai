import Stub from "./Stub";
import type { RoomSlug } from "../content/rooms";

export default function Room({ slug }: { slug: RoomSlug }) {
  return <Stub title={slug} />;
}
