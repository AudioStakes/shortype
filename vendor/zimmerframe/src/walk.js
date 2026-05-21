/**
 * @template {{ type: string }} T
 * @template {Record<string, any> | null} U
 * @param {T} node
 * @param {U} state
 * @param {import('../types/index.d.ts').Visitors<T, U>} visitors
 */
export function walk(node, state, visitors) {
	const universal = visitors._;

	let stopped = false;

	function defaultVisitor(_, { next, state: currentState }) {
		next(currentState);
	}

	function visit(currentNode, path, currentState) {
		if (stopped) return;
		if (!currentNode.type) return;

		let result;
		const mutations = {};

		const context = {
			path,
			state: currentState,
			next: (nextState = currentState) => {
				path.push(currentNode);
				for (const key in currentNode) {
					if (key === 'type') continue;

					const childNode = currentNode[key];
					if (childNode && typeof childNode === 'object') {
						if (Array.isArray(childNode)) {
							const arrayMutations = {};
							const len = childNode.length;
							let mutated = false;

							for (let i = 0; i < len; i++) {
								const node = childNode[i];
								if (node && typeof node === 'object') {
									const childResult = visit(node, path, nextState);
									if (childResult) {
										arrayMutations[i] = childResult;
										mutated = true;
									}
								}
							}

							if (mutated) {
								mutations[key] = childNode.map(
									(node, i) => arrayMutations[i] ?? node
								);
							}
						} else {
							const childResult = visit(childNode, path, nextState);
							if (childResult) {
								mutations[key] = childResult;
							}
						}
					}
				}
				path.pop();

				if (Object.keys(mutations).length > 0) {
					return applyMutations(currentNode, mutations);
				}
			},
			stop: () => {
				stopped = true;
			},
			visit: (nextNode, nextState = currentState) => {
				path.push(currentNode);
				const childResult = visit(nextNode, path, nextState) ?? nextNode;
				path.pop();
				return childResult;
			},
		};

		let visitor = visitors[currentNode.type] ?? defaultVisitor;

		if (universal) {
			let innerResult;

			result = universal(currentNode, {
				...context,
				next: (nextState = currentState) => {
					currentState = nextState;

					innerResult = visitor(currentNode, {
						...context,
						state: nextState,
					});

					return innerResult;
				},
			});

			if (!result && innerResult) {
				result = innerResult;
			}
		} else {
			result = visitor(currentNode, context);
		}

		if (!result && Object.keys(mutations).length > 0) {
			result = applyMutations(currentNode, mutations);
		}

		if (result) {
			return result;
		}
	}

	return visit(node, [], state) ?? node;
}

function applyMutations(node, mutations) {
	const obj = {};
	const descriptors = Object.getOwnPropertyDescriptors(node);

	for (const key in descriptors) {
		Object.defineProperty(obj, key, descriptors[key]);
	}

	for (const key in mutations) {
		obj[key] = mutations[key];
	}

	return obj;
}
