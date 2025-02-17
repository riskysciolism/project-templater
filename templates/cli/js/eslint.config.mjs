import eslint from '@eslint/js';
import prettierlint from 'eslint-config-prettier';
import globals from 'globals';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';

export default [
	eslint.configs.recommended,
	prettierlint,
	{
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
		plugins: {
			'no-relative-import-paths': noRelativeImportPaths,
		},
		rules: {
			'arrow-body-style': 'error',
			camelcase: 'error',
			curly: ['error', 'multi', 'consistent'],
			'default-param-last': 'off',
			'dot-notation': [
				'error',
				{
					allowPattern: '^[a-z]+(_[a-z]+)+$',
				},
			],
			eqeqeq: 'error',
			'func-style': [
				'error',
				'declaration',
				{
					allowArrowFunctions: true,
				},
			],
			'logical-assignment-operators': 'error',
			'multiline-comment-style': 'error',
			'new-cap': [
				'error',
				{
					capIsNew: false,
				},
			],
			'no-alert': 'error',
			'no-console': [
				'error',
				{
					allow: ['debug', 'error', 'info', 'warn'],
				},
			],
			'no-constant-binary-expression': 'error',
			'no-else-return': 'error',
			'no-empty-function': 'error',
			'no-eval': 'error',
			'no-lonely-if': 'error',
			'no-relative-import-paths/no-relative-import-paths': [
				'error',
				{
					allowSameFolder: true,
				},
			],
			'no-self-compare': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'operator-assignment': 'error',
			'prefer-arrow-callback': 'error',
			'prefer-const': 'error',
			'prefer-object-spread': 'error',
			'prefer-rest-params': 'error',
			'prefer-spread': 'error',
			'prefer-template': 'error',
			'sort-imports': [
				'error',
				{
					allowSeparatedGroups: true,
					ignoreDeclarationSort: true,
				},
			],
			'sort-keys': [
				'error',
				'asc',
				{
					allowLineSeparatedGroups: true,
				},
			],
			yoda: 'error',
		},
	},
];
