declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Loader, LoadingManager } from 'three';
  import { Group } from 'three';

  export interface GLTF {
    scene: Group;
    scenes: Group[];
    cameras: any[];
    animations: any[];
    asset: any;
    parser: any;
    userData: any;
  }

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { EventDispatcher, Camera, Vector3 } from 'three';

  export interface OrbitControlsEventMap {
    change: {};
    start: {};
    end: {};
  }

  export class OrbitControls extends EventDispatcher<OrbitControlsEventMap> {
    constructor(camera: Camera, domElement?: HTMLElement | Document);
    object: Camera;
    domElement: HTMLElement | Document;
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableKeys: boolean;
    keys: any;
    mouseButtons: any;
    touches: any;
    update(): boolean;
    reset(): void;
    dispose(): void;
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    getDistance(): number;
    listenToKeyEvents(domElement: HTMLElement): void;
    stopListenToKeyEvents(): void;
    saveState(): void;
    reset(): void;
    toJSON(): any;
    fromJSON(json: any): void;
  }
}
