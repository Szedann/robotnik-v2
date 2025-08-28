import { Glob } from "bun";

type ClassType = new (...args: any) => any;

export async function parseFileObjects<T extends ClassType>(path: string, objectClass: T, key: string = objectClass.name, pattern: string = "**/*.tsx"):Promise<Map<string, InstanceType<T>>>{
  const glob = new Glob(pattern)
  const results = new Map<string, InstanceType<T>>()
  console.log(glob)
  for await (const match of glob.scan(path)){
    const file = await import(path+match)
    console.log(file)
    if(file[key] instanceof objectClass)
      results.set(match, file[key])
  }
  return results;
}