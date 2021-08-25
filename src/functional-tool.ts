export class FunctionalTool {
	public static multiplyFn<ItemType>(singleFn: (item: ItemType) => any, array: ItemType[]): void {
		for (const element of array) {
			singleFn(element);
		}
	}
	public static multiplyFnCollect<ItemType, ReturnType>(singleFn: (item: ItemType) => ReturnType, array: ItemType[]): ReturnType[] {
		const results: ReturnType[] = [];
		for (const element of array) {
			results.push(singleFn(element));
		}
		return results;
	}
	public static walkPropTree(rootNode: any, leafFn: (leaf: any) => any, nodeFn: (node: any) => any, arrayFn: (array: any) => any): void {
		for (const key in rootNode) {
			if (Object.prototype.hasOwnProperty.call(rootNode, key)) {
				const selectedProp: any = rootNode[key];
				if (Array.isArray(selectedProp)) {
					arrayFn(selectedProp);
					for (const element of selectedProp) {
						FunctionalTool.walkPropTree(element, leafFn, nodeFn, arrayFn);
					}
				} else if (typeof selectedProp === 'object') {
					nodeFn(selectedProp);
					FunctionalTool.walkPropTree(selectedProp, leafFn, nodeFn, arrayFn);
				} else {
					leafFn(selectedProp);
				}
			}
		}
	}

	public static arrayCallPromiseCollect(targetObjects: any[], targetMethodMember: string, args: any[]): Promise<any[]> {
		const promises: Promise<any>[] = [];
		for (const target of targetObjects) {
			promises.push(target[targetMethodMember](...args));
		}
		return Promise.all(promises);
	}

	public static removeArrayItem<ItemType>(array: ItemType[], item: ItemType): void {
		const activeSubIndex: number = array.indexOf(item);
		if (activeSubIndex > -1) {
			array.splice(activeSubIndex);
		}
	}
}
