import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Hashids from "hashids";

const hashids = new Hashids(
  process.env.NEXT_PUBLIC_HASH_SALT,
  5
);

/**
 * 
 * @param id 
 * @returns hashed ids
 */
export function encodeId(id: number): string {
  return hashids.encode(id);
}
/**
 * 
 * @param hash 
 * @returns decoded ids
 */
export function decodeId(hash: string): number | null {
  const decoded = hashids.decode(hash);
  return decoded.length ? Number(decoded[0]) : null;
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/*

this function is used to build a url from a template and variables
@example
buildUrl('/api/user/:id', [1])
@example
buildUrl('/api/user/:id/:name', [1, 'name'])
@output
/api/user/1
/api/user/1/name

*/
type UrlVar = string | number | boolean;

export function buildUrl(
  template: string,
  vars?: UrlVar[]
): string {

  const paramNames = [...template.matchAll(/:([a-zA-Z0-9_]+)/g)]
    .map(match => match[1]);

  if (!vars || vars.length === 0) {
    if (paramNames.length > 0) {
      throw new Error(
        `Missing URL variables: ${paramNames.join(', ')}`
      );
    }
    return template;
  }

  if (vars.length !== paramNames.length) {
    throw new Error(
      `Expected ${paramNames.length} variables (${paramNames.join(', ')}), got ${vars.length}`
    );
  }

  let url = template;


  paramNames.forEach((name, index) => {
    url = url.replace(
      `:${name}`,
      encodeURIComponent(String(vars[index]))
    );
  });

  return url;
}

