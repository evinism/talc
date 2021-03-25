import talc from "./talc";
import { env } from "process";

talc(process.argv, env["TALCDIR"] || process.cwd());
