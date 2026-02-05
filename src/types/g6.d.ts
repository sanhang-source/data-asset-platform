// src/types/g6.d.ts
declare module '@antv/g6' {
  // Define basic G6 types to resolve compilation errors
  export interface GraphOptions {
    container: string | HTMLElement;
    width: number;
    height: number;
    layout?: any;
    defaultNode?: any;
    defaultEdge?: any;
    nodeStateStyles?: any;
    modes?: any;
    [key: string]: any;
  }

  export class Graph {
    constructor(config: GraphOptions);
    data(data: any): void;
    render(): void;
    changeData(data?: any): void;
    setItemState(item: any, state: string, enabled: boolean): void;
    changeSize(width: number, height: number): void;
    on(event: string, callback: Function): void;
    destroy(): void;
    fitView(): void;
    zoomTo(ratio: number, center?: any): void;
    refresh(): void;
    [key: string]: any;
  }

  // Export other common G6 classes and functions
  export const Util: any;
  export const G: any;
  export const Layouts: any;
  export const Shapes: any;
  export const Plugins: any;
}