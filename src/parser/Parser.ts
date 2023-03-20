export default interface Parser<T> {
   parse(content: string | Buffer): T
   encode(value: T): string | Buffer
}
