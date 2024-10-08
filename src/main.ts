import talc from "./talc.js";
import { env } from "process";

talc(process.argv, env["TALCDIR"] || process.cwd());
