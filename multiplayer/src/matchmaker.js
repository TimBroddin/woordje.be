import { DurableObject } from "cloudflare:workers";
import { createRoom, roomStub } from "./room.js";

/**
 * One matchmaker per word length ("quick-5", ...). It remembers the public
 * room that is currently filling up and hands its code to everyone asking,
 * until that room starts or fills; then it opens a new one.
 */
export class Matchmaker extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.queue = Promise.resolve();
  }

  find(wordLength) {
    // Serialise lookups so simultaneous requests don't each open a new room
    const result = this.queue.then(() => this.findOrOpen(wordLength));
    this.queue = result.catch(() => {});
    return result;
  }

  async findOrOpen(wordLength) {
    const current = await this.ctx.storage.get("code");
    if (current && (await roomStub(this.env, current).joinable())) return current;

    const code = await createRoom(this.env, { isPublic: true, wordLength });
    await this.ctx.storage.put("code", code);
    return code;
  }
}
