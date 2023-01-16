import * as fs from 'fs';
import * as syspath from 'path';
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

	public static unique<Type>(array: Type[]): Type[] {
		return array.filter((item: Type, index: number, toFilterArray: Type[]) => toFilterArray.indexOf(item) === index);
	}

	public static walkTree<Type>(rootNode: Type, walkOptions: IWalkOptions<Type>): void {
		const children: any[] = walkOptions.getChildren(rootNode);

		for (const child of children) {
			if (walkOptions.shouldTransverse(child)) {
				FunctionalTool.walkTree(child, walkOptions);
			}
			walkOptions.processChild(child);
		}
	}

	public static walkDirectoryRecursive(path: string, walkDirOptions: IWalkDirOptions): void {
		const walkOptions: IWalkOptions<string> = {
			getChildren: (path: string) => {
				const relChildPaths: string[] = fs.readdirSync(path);
				return relChildPaths.map((relpath: string) => syspath.join(path, relpath));
			},
			shouldTransverse: (path: string) => {
				walkDirOptions.processDirectory(path);
				return fs.lstatSync(path).isDirectory();
			},
			processChild: walkDirOptions.processFile
		};
		return FunctionalTool.walkTree<string>(path, walkOptions);
	}

	public copyDirectoryRecursive(sourcePath: string, targetPath: string) {
		const walkOptions: IWalkDirOptions = {
			processFile: (path: string) => {
				const fileName: string = syspath.basename(path);
				const targetFilePath: string = syspath.join(targetPath, fileName);
				fs.copyFileSync(path, targetFilePath);
			},
			processDirectory: (path: string) => {}
		};
		return FunctionalTool.walkDirectoryRecursive(sourcePath, walkOptions);
	}
}
export interface IWalkOptions<Type> {
	getChildren(node: Type): any[];
	shouldTransverse(child: any): boolean;
	processChild(child: any): void;
}

export interface IWalkDirOptions {
	processFile(filePath: string): void;
	processDirectory(directoryPath: string): void;
}
