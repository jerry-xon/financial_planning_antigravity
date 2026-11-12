/** Minimal stub so Edge engine bundles never pull real Supabase. */
export function createClient() {
  const empty = (data = null) => Promise.resolve({ data, error: null });
  const chain = {
    select: () => chain,
    eq: () => chain,
    not: () => chain,
    order: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    single: () => empty(null),
    maybeSingle: () => empty(null),
    then: (resolve, reject) => empty([]).then(resolve, reject),
  };
  return {
    from: () => chain,
    auth: {
      getUser: () => empty({ user: null }),
      getSession: () => empty({ session: null }),
    },
    functions: { invoke: () => empty(null) },
  };
}

export default { createClient };
