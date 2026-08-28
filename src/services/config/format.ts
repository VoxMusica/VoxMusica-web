import convict from 'convict'


export class EnvVarError extends Error{}
export class EnumArrayError extends Error{}

const registeredEnumArrayFormats = new Set<string>();

export const enumArrayFormat = (name: string, allowedValues: readonly string[]): string => {
  // avoid re-registering the same name twice (schema.ts may be re-imported, e.g. in tests)
  if (registeredEnumArrayFormats.has(name)) {
    return name;
  }

  convict.addFormat({
    name,
    validate: (val: unknown) => {
      if (!Array.isArray(val)) {
        throw new EnumArrayError('must be an array');
      }
      const invalid = val.filter((v) => !allowedValues.includes(v));
      if (invalid.length > 0) {
        throw new EnumArrayError(
          `contains unsupported value(s): ${invalid.join(', ')}. Allowed: ${allowedValues.join(', ')}`
        );
      }
    },
    coerce: (val: unknown) => {
      if (typeof val === 'string') {
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return val;
    },
  });

  registeredEnumArrayFormats.add(name);
  return name;
}

convict.addFormat({
  name: 'string-array',
  validate: (val: unknown) => {
    if (!Array.isArray(val)) {
      throw new EnvVarError('must be an array of strings');
    }
    if (!val.every((v) => typeof v === 'string')) {
      throw new EnvVarError('all entries must be strings');
    }
  },
  coerce: (val: unknown) => {
    // env vars arrive as a single string — split on comma
    if (typeof val === 'string') {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return val;
  },
})
