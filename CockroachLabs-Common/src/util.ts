import { ClusterPostRequest } from "../../CockroachLabs-Common/src/types"

export enum CaseTransformer {
	PASCAL_TO_CAMEL,
	PASCAL_TO_SNAKE,
	SNAKE_TO_CAMEL,
}

type PlainObject = { [i: string]: any }

export class Transformer {
	private readonly _object: PlainObject
	private caseTransformer: CaseTransformer
	private useSafeKeys: boolean
	private format: Partial<ClusterPostRequest>
	private LANGUAGE_KEYWORDS = [
		"abstract",
		"any",
		"as",
		"async",
		"await",
		"bigint",
		"boolean",
		"break",
		"case",
		"catch",
		"class",
		"configurable",
		"const",
		"constructor",
		"continue",
		"debugger",
		"declare",
		"default",
		"delete",
		"do",
		"else",
		"enum",
		"enumerable",
		"export",
		"extends",
		"false",
		"finally",
		"for",
		"from",
		"function",
		"get",
		"if",
		"in",
		"implements",
		"import",
		"instanceof",
		"interface",
		"is",
		"let",
		"module",
		"namespace",
		"never",
		"new",
		"null",
		"number",
		"of",
		"package",
		"private",
		"protected",
		"public",
		"readonly",
		"require",
		"return",
		"set",
		"static",
		"string",
		"super",
		"switch",
		"symbol",
		"this",
		"throw",
		"true",
		"try",
		"type",
		"typeof",
		"undefined",
		"value",
		"var",
		"void",
		"while",
		"with",
		"writable",
		"yield",
	]

	constructor(object: PlainObject) {
		this._object = object
	}

	/**
	 * Returns an instance of `Transformer` for the given object, that let you chain other options/methods.
	 * This is intended to always call at then end {@link Transformer#transform} to return the transformed object.
	 *
	 * @param object The object for which you wish the transform its keys.
	 */
	public static for(object: PlainObject) {
		return new Transformer(object)
	}

	/**
	 * Used to specify how to transform the keys, like PascalCase to camelCase.
	 * See enum {@link CaseTransformer} for all available options.
	 *
	 * @param caseTransformer The transformer to use on the object keys.
	 */
	public transformKeys(caseTransformer: CaseTransformer) {
		this.caseTransformer = caseTransformer
		return this
	}

	/**
	 * Used to generate transform keys with format that the model auto-generation for TypeScript expects.
	 *
	 * Detail: The model auto-generation will suffix keys with `_` if they are keywords from the language
	 * (see https://github.com/cloudsoft/cloudformation-cli-typescript-plugin/blob/master/python/rpdk/typescript/utils.py#L83-L86)
	 */
	public forModelIngestion() {
		this.useSafeKeys = true
		return this
	}

	/**
	 * Transform the given object keys, according to the given {@link CaseTransformer}.
	 *
	 * This will return `undefined` if given `object` is not set.
	 * This will throw an exception is the given {@link CaseTransformer} is invalid.
	 */
	public transform() {
		switch (this.caseTransformer) {
			case CaseTransformer.PASCAL_TO_CAMEL:
				return this.transformObjectKeys(this._object, key => key.substring(0, 1).toLocaleLowerCase() + key.substring(1))
			case CaseTransformer.PASCAL_TO_SNAKE:
				return this.transformObjectKeys(
					this._object,
					key =>
						key.substring(0, 1).toLocaleLowerCase() +
						key.substring(1).replace(/([A-Z])/g, input => `_${input.toLocaleLowerCase()}`)
				)
			case CaseTransformer.SNAKE_TO_CAMEL:
				return this.transformObjectKeys(
					this._object,
					key =>
						key.substring(0, 1).toLocaleLowerCase() +
						key.substring(1).replace(/_([a-z])/g, (input, p1) => `${p1.toLocaleUpperCase()}`)
				)
			default:
				throw new Error(`Case transformer "${this.caseTransformer}" not supported`)
		}
	}

	/**
	 * Copy object values to new, reformatted object.
	 *
	 * This will return `undefined` if given `object` is not set.
	 * This will throw an exception if the given reformatted object is invalid.
	 */
	public transformShape(format: PlainObject) {
		this.format = format
		return this
	}

	private reshape(source: PlainObject, format = this.format): typeof format {
		let reformatted: typeof format = {}

		Object.keys(format).forEach(key => {
			if (Array.isArray(format[key])) {
				reformatted[key] = format[key].concat(source[key]).flat()
				return
			}
			if (["number", "boolean", "string"].includes(typeof format[key])) {
				reformatted[key] = source[key]
				return
			}
			if (format[key] !== null && typeof format[key] === "object") {
				reformatted[key] = this.reshape(source, format[key])
				return
			}
		})
		return reformatted
	}

	private transformObjectKeys(object: PlainObject, transformer: (key: string) => string) {
		if (!object) {
			return object
		}

		const transformed = Object.keys(object).reduce((map, key) => {
			let value = object[key]
			if (value && value instanceof Object && !(value instanceof Array) && !(value instanceof Set)) {
				value = this.transformObjectKeys(value, transformer)
			}
			if (value && value instanceof Set) {
				value = Array.of(...value)
			}
			if (value && Array.isArray(value)) {
				value = value.map(item =>
					item && item instanceof Object && !(item instanceof Array) && !(item instanceof Set)
						? this.transformObjectKeys(item, transformer)
						: item
				)
			}
			let newKey = transformer(key)
			if (this.useSafeKeys) {
				newKey = this.safeKey(newKey)
			}
			map[newKey] = value
			return map
		}, {} as PlainObject)

		if (this.format instanceof Object) {
			return this.reshape(transformed)
		} else {
			return transformed
		}
	}

	private safeKey(key: string) {
		return this.LANGUAGE_KEYWORDS.includes(key) ? `${key}_` : key
	}
}

// For backwards compatibility
export function transformObjectCase(model: PlainObject, caseTransformer: CaseTransformer) {
	return Transformer.for(model).transformKeys(caseTransformer).transform()
}
