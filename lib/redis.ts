import { Redis } from '@upstash/redis';

if (process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    (!process.env.UPSTASH_REDIS_REST_URL ||
     process.env.UPSTASH_REDIS_REST_URL.includes('mock'))) {
  throw new Error(
    'Production environment detected without a valid UPSTASH_REDIS_REST_URL. ' +
    'Refusing to start with mock Redis in production.'
  );
}

const shouldUseMockRedis =
  process.env.NODE_ENV !== 'production' &&
  (!process.env.UPSTASH_REDIS_REST_URL ||
   process.env.UPSTASH_REDIS_REST_URL.includes('mock'));

class MockPipeline {
  private store: Map<string, any>;
  private commands: (() => any)[] = [];
  constructor(store: Map<string, any>) {
    this.store = store;
  }
  zremrangebyscore(key: string, min: number, max: number) {
    this.commands.push(() => 0);
    return this;
  }
  zadd(key: string, ...args: any[]) {
    this.commands.push(() => 1);
    return this;
  }
  zcard(key: string) {
    this.commands.push(() => 1);
    return this;
  }
  expire(key: string, seconds: number) {
    this.commands.push(() => 1);
    return this;
  }
  incr(key: string) {
    this.commands.push(() => {
      const val = Number(this.store.get(key)) || 0;
      this.store.set(key, val + 1);
      return val + 1;
    });
    return this;
  }
  async exec() {
    return this.commands.map(cmd => cmd());
  }
}

class MockRedis {
  private store = new Map<string, any>();
  async get(key: string) {
    const val = this.store.get(key);
    if (val === undefined) return null;
    return val;
  }
  async set(key: string, value: any, options?: { ex?: number }) {
    this.store.set(key, value);
    if (options?.ex) {
      setTimeout(() => {
        this.store.delete(key);
      }, options.ex * 1000);
    }
    return 'OK';
  }
  async del(key: string) {
    this.store.delete(key);
    return 1;
  }
  pipeline() {
    return new MockPipeline(this.store);
  }
}

export const redis = shouldUseMockRedis
  ? (new MockRedis() as unknown as Redis)
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
