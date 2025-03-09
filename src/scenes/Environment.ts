import * as THREE from "three";

interface EnvironmentObjects {
  ruins: THREE.Group;
  plants: THREE.Group;
  campfire: THREE.Group;
  tent: THREE.Group;
}

export class Environment {
  private scene: THREE.Scene;
  private clouds: THREE.Group;
  private environmentObjects: EnvironmentObjects;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createSky();
    this.clouds = this.createClouds();
    this.environmentObjects = {
      ruins: this.createRuins(),
      plants: this.createPlants(),
      campfire: this.createCampfire(),
      tent: this.createTent(),
    };
  }

  private createSky(): void {
    // Create a large sphere geometry
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);

    // Create a shader material with a blue gradient
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) }, // Darker blue at top
        bottomColor: { value: new THREE.Color(0x87ceeb) }, // Light blue at horizon
        offset: { value: 33 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
      side: THREE.BackSide,
    });

    // Create the sky mesh
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
  }

  private createClouds(): THREE.Group {
    const clouds = new THREE.Group();
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6, // Reduced opacity for more subtle clouds
    });

    // Create fewer cloud clusters
    for (let i = 0; i < 25; i++) {
      // Reduced from 40 to 25
      const cloudCluster = new THREE.Group();

      // Position clouds much higher and further away
      const x = Math.random() * 200 - 100; // Wider spread (-100 to 100)
      const z = Math.random() * 200 - 100; // Wider spread (-100 to 100)
      const y = 50 + Math.random() * 30; // Much higher (50-80 units high)

      cloudCluster.position.set(x, y, z);

      // Create smaller, more subtle cloud clusters
      const numPuffs = 3 + Math.floor(Math.random() * 3); // Fewer puffs (3-5)
      for (let j = 0; j < numPuffs; j++) {
        const puffSize = 2 + Math.random() * 3; // Slightly smaller puffs
        const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
        const puff = new THREE.Mesh(puffGeometry, cloudMaterial);

        // Position each puff with less spread
        puff.position.set(
          Math.random() * 4 - 2,
          Math.random() * 2 - 1,
          Math.random() * 4 - 2,
        );

        cloudCluster.add(puff);
      }

      clouds.add(cloudCluster);
    }

    this.scene.add(clouds);
    return clouds;
  }

  // Method to get clouds for animation
  public getClouds(): THREE.Group {
    return this.clouds;
  }

  // Method to update clouds (can be called in animation loop)
  public updateClouds(): void {
    // Add any cloud animation logic here if needed
    // For example, gentle floating motion
  }

  private createRuins(): THREE.Group {
    const ruins = new THREE.Group();

    // Create stone material with slight roughness for realism
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.7,
      metalness: 0.1,
    });

    // Create a central stone circle platform (temple foundation)
    const platformRadius = 5;
    const platformHeight = 0.4;
    const platformGeometry = new THREE.CylinderGeometry(
      platformRadius,
      platformRadius,
      platformHeight,
      32,
    );
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x707070,
      roughness: 0.8,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, platformHeight / 2, 0);
    ruins.add(platform);

    // Add temple floor with decorative patterns
    const floorGeometry = new THREE.CircleGeometry(4.7, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x909090,
      roughness: 0.6,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, platformHeight + 0.01, 0);
    ruins.add(floor);

    // Add decorative pattern to the floor
    const patternGeometry = new THREE.RingGeometry(2.5, 2.7, 32);
    const patternMaterial = new THREE.MeshStandardMaterial({
      color: 0x505050,
      roughness: 0.9,
      metalness: 0.1,
    });
    const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
    pattern.rotation.x = -Math.PI / 2;
    pattern.position.set(0, platformHeight + 0.02, 0);
    ruins.add(pattern);

    // Create temple columns (some standing, some fallen)
    const createColumn = (
      x: number,
      z: number,
      height: number,
      fallen: boolean,
      rotation: number = 0,
    ) => {
      const columnRadius = 0.4;
      const columnGeometry = new THREE.CylinderGeometry(
        columnRadius,
        columnRadius,
        height,
        16,
      );
      const column = new THREE.Mesh(columnGeometry, stoneMaterial);

      if (fallen) {
        // Fallen column
        column.rotation.z = Math.PI / 2 + rotation;
        column.position.set(x, columnRadius, z);
      } else {
        // Standing column
        column.position.set(x, height / 2 + platformHeight, z);
      }

      // Add column base
      if (!fallen) {
        const baseRadius = 0.5;
        const baseHeight = 0.2;
        const baseGeometry = new THREE.CylinderGeometry(
          baseRadius,
          baseRadius,
          baseHeight,
          16,
        );
        const base = new THREE.Mesh(baseGeometry, stoneMaterial);
        base.position.set(0, -height / 2 - baseHeight / 2, 0);
        column.add(base);

        // Add column capital
        const capitalGeometry = new THREE.BoxGeometry(1, 0.3, 1);
        const capital = new THREE.Mesh(capitalGeometry, stoneMaterial);
        capital.position.set(0, height / 2 + 0.15, 0);
        column.add(capital);
      }

      ruins.add(column);
      return column;
    };

    // Create columns in a circular pattern
    const columnPositions = [
      { x: 3.5, z: 0, height: 4, fallen: false },
      { x: 2.5, z: 2.5, height: 4, fallen: false },
      { x: 0, z: 3.5, height: 4, fallen: false },
      { x: -2.5, z: 2.5, height: 4, fallen: false },
      { x: -3.5, z: 0, height: 4, fallen: true, rotation: 0.3 },
      { x: -2.5, z: -2.5, height: 4, fallen: true, rotation: -0.2 },
      { x: 0, z: -3.5, height: 4, fallen: false },
      { x: 2.5, z: -2.5, height: 4, fallen: false },
    ];

    columnPositions.forEach((pos) => {
      createColumn(pos.x, pos.z, pos.height, pos.fallen, pos.rotation);
    });

    // Create fallen architectural elements (instead of a roof)
    const createFallenArchitecturalElement = (
      x: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      rotation: number,
    ) => {
      const elementGeometry = new THREE.BoxGeometry(width, height, depth);
      const element = new THREE.Mesh(elementGeometry, stoneMaterial);
      element.position.set(x, height / 2 + 0.05, z);
      element.rotation.y = rotation;
      ruins.add(element);
    };

    // Add fallen capitals (the tops of columns)
    const createFallenCapital = (x: number, z: number, rotation: number) => {
      const capitalGeometry = new THREE.BoxGeometry(1, 0.3, 1);
      const capital = new THREE.Mesh(capitalGeometry, stoneMaterial);
      capital.position.set(x, 0.15, z);
      capital.rotation.y = rotation;
      ruins.add(capital);
    };

    // Add fallen column sections
    const createFallenColumnSection = (
      x: number,
      z: number,
      length: number,
      rotation: number,
    ) => {
      const columnRadius = 0.4;
      const columnGeometry = new THREE.CylinderGeometry(
        columnRadius,
        columnRadius,
        length,
        16,
      );
      const column = new THREE.Mesh(columnGeometry, stoneMaterial);
      column.position.set(x, columnRadius, z);
      column.rotation.z = Math.PI / 2;
      column.rotation.y = rotation;
      ruins.add(column);
    };

    // Add fallen architectural elements around the temple
    createFallenArchitecturalElement(1, 2, 2.5, 0.4, 0.8, 0.3);
    createFallenArchitecturalElement(-2, 1, 3, 0.4, 0.8, -0.5);
    createFallenArchitecturalElement(2, -1.5, 2, 0.4, 0.8, 0.7);
    createFallenArchitecturalElement(-1.5, -2, 2.5, 0.4, 0.8, -0.2);

    // Add fallen capitals
    createFallenCapital(3, 3, 0.4);
    createFallenCapital(-3, 2, -0.3);
    createFallenCapital(2, -3, 0.7);
    createFallenCapital(-2, -3, -0.5);

    // Add fallen column sections
    createFallenColumnSection(0, 2, 2, 0.3);
    createFallenColumnSection(-2, -1, 1.5, -0.4);
    createFallenColumnSection(1, -2, 2.5, 0.8);

    // Create broken roof pieces on the ground (remnants of the collapsed roof)
    const createRoofPiece = (
      x: number,
      z: number,
      width: number,
      depth: number,
      rotation: number,
    ) => {
      const pieceGeometry = new THREE.BoxGeometry(width, 0.3, depth);
      const piece = new THREE.Mesh(pieceGeometry, stoneMaterial);
      piece.position.set(x, platformHeight + 0.15, z);
      piece.rotation.y = rotation;
      ruins.add(piece);
    };

    createRoofPiece(3, 2, 2, 1.5, 0.4);
    createRoofPiece(2, -3, 1.5, 2, -0.3);
    createRoofPiece(-3, -2, 2, 1.8, 0.7);
    createRoofPiece(0, 1, 2.5, 1.2, 0.1);
    createRoofPiece(-1, -1, 1.8, 1.5, -0.2);

    // Create fallen wall sections instead of standing walls
    const createFallenWallSection = (
      x: number,
      z: number,
      width: number,
      height: number,
      rotation: number,
    ) => {
      const wallGeometry = new THREE.BoxGeometry(width, height, 0.4);
      const wall = new THREE.Mesh(wallGeometry, stoneMaterial);
      wall.position.set(x, height / 2 + 0.05, z);
      wall.rotation.y = rotation;
      // Add some tilt to make it look like it fell over
      wall.rotation.x = Math.random() * 0.2 - 0.1;
      ruins.add(wall);
    };

    // Add fallen wall sections around the temple
    createFallenWallSection(2, 3.5, 3, 0.6, 0.1);
    createFallenWallSection(-2.5, 3, 2.5, 0.5, -0.2);
    createFallenWallSection(-3.5, -2, 2, 0.4, 0.7);

    // Add some fallen stones and debris around the temple
    const debrisPositions = [
      { x: 4, z: 4, size: 0.6 },
      { x: -4, z: 4, size: 0.5 },
      { x: 4, z: -4, size: 0.7 },
      { x: -4, z: -4, size: 0.5 },
      { x: 6, z: 0, size: 0.8 },
      { x: -6, z: 0, size: 0.7 },
      { x: 0, z: 6, size: 0.6 },
      { x: 0, z: -6, size: 0.5 },
      { x: 3, z: 5, size: 0.5 },
      { x: -3, z: 5, size: 0.6 },
      { x: 5, z: 3, size: 0.4 },
    ];

    debrisPositions.forEach((pos) => {
      const stoneGeometry = new THREE.BoxGeometry(pos.size, pos.size, pos.size);
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
      stone.position.set(pos.x, pos.size / 2, pos.z);
      stone.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      ruins.add(stone);
    });

    // Add a temple altar in the center
    const altarBaseGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
    const altarBase = new THREE.Mesh(altarBaseGeometry, stoneMaterial);
    altarBase.position.set(0, platformHeight + 0.25, 0);
    ruins.add(altarBase);

    const altarTopGeometry = new THREE.BoxGeometry(1.2, 0.2, 1.2);
    const altarTop = new THREE.Mesh(altarTopGeometry, stoneMaterial);
    altarTop.position.set(0, platformHeight + 0.6, 0);
    ruins.add(altarTop);

    this.scene.add(ruins);
    return ruins;
  }

  // Helper function to create a simple stone texture
  private createStoneTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (context) {
      // Fill with base stone color
      context.fillStyle = "#808080";
      context.fillRect(0, 0, 256, 256);

      // Add some noise for texture
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = Math.random() * 40 - 20;
        const size = Math.random() * 3 + 1;

        context.fillStyle = `rgba(${128 + brightness}, ${128 + brightness}, ${128 + brightness}, 0.5)`;
        context.fillRect(x, y, size, size);
      }

      // Add some cracks
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const length = Math.random() * 50 + 20;
        const angle = Math.random() * Math.PI * 2;

        context.strokeStyle = "rgba(60, 60, 60, 0.7)";
        context.lineWidth = Math.random() * 2 + 1;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length,
        );
        context.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private createPlants(): THREE.Group {
    const plants = new THREE.Group();

    // Create grass material
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      roughness: 0.8,
    });

    // Create flower material
    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      roughness: 0.5,
    });

    // Add grass patches
    for (let i = 0; i < 100; i++) {
      const grassHeight = 0.3 + Math.random() * 0.2;
      const grassGeometry = new THREE.ConeGeometry(0.1, grassHeight, 4);
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);

      const x = Math.random() * 40 - 20;
      const z = Math.random() * 40 - 20;
      grass.position.set(x, grassHeight / 2, z);
      grass.rotation.y = Math.random() * Math.PI;

      plants.add(grass);
    }

    // Add flowers
    for (let i = 0; i < 20; i++) {
      const flowerGroup = new THREE.Group();

      // Flower stem
      const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
      const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.y = 0.25;
      flowerGroup.add(stem);

      // Flower head
      const petalGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const flower = new THREE.Mesh(petalGeometry, flowerMaterial);
      flower.position.y = 0.5;
      flowerGroup.add(flower);

      const x = Math.random() * 40 - 20;
      const z = Math.random() * 40 - 20;
      flowerGroup.position.set(x, 0, z);

      plants.add(flowerGroup);
    }

    this.scene.add(plants);
    return plants;
  }

  private createCampfire(): THREE.Group {
    const campfire = new THREE.Group();

    // Create stones around the campfire
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
    });

    for (let i = 0; i < 10; i++) {
      const stoneGeometry = new THREE.SphereGeometry(0.4, 6, 6);
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

      const angle = (i / 10) * Math.PI * 2;
      const radius = 1.2;
      stone.position.set(
        Math.cos(angle) * radius,
        0.15,
        Math.sin(angle) * radius,
      );

      campfire.add(stone);
    }

    // Create logs
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2f1b,
      roughness: 1,
    });

    for (let i = 0; i < 5; i++) {
      const logGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 6);
      const log = new THREE.Mesh(logGeometry, woodMaterial);

      const angle = (i / 5) * Math.PI * 2;
      log.position.set(Math.cos(angle) * 0.4, 0.15, Math.sin(angle) * 0.4);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = angle;

      campfire.add(log);
    }

    // Add embers/ash
    const embersMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 1,
    });

    const embersGeometry = new THREE.CircleGeometry(0.8, 16);
    const embers = new THREE.Mesh(embersGeometry, embersMaterial);
    embers.rotation.x = -Math.PI / 2;
    campfire.add(embers);

    // Add glowing coals
    const coalsMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      roughness: 0.5,
      emissive: 0xff2200,
      emissiveIntensity: 0.5,
    });

    const coalsGeometry = new THREE.CircleGeometry(0.6, 16);
    const coals = new THREE.Mesh(coalsGeometry, coalsMaterial);
    coals.rotation.x = -Math.PI / 2;
    coals.position.y = 0.01;
    campfire.add(coals);

    // Add a flickering point light
    const fireLight = new THREE.PointLight(0xff6600, 3, 15);
    fireLight.position.set(0, 0.8, 0);
    campfire.add(fireLight);

    // Add a secondary light for more glow
    const secondaryLight = new THREE.PointLight(0xff9900, 1.5, 8);
    secondaryLight.position.set(0, 0.4, 0);
    campfire.add(secondaryLight);

    // Create flame particles
    const createFlame = (
      height: number,
      width: number,
      color: number,
      x: number,
      z: number,
    ) => {
      const flameGeometry = new THREE.ConeGeometry(width, height, 8, 1, true);
      const flameMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
      });

      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(x, height / 2, z);
      return flame;
    };

    // Add main flames
    const mainFlame = createFlame(2.0, 0.6, 0xff6600, 0, 0);
    campfire.add(mainFlame);

    // Add secondary flames
    campfire.add(createFlame(1.6, 0.4, 0xff9900, 0.2, 0.1));
    campfire.add(createFlame(1.4, 0.3, 0xff9900, -0.2, -0.1));
    campfire.add(createFlame(1.2, 0.25, 0xffcc00, 0.1, -0.2));
    campfire.add(createFlame(1.0, 0.2, 0xffcc00, -0.1, 0.2));

    // Add inner bright flame
    const innerFlame = createFlame(1.2, 0.3, 0xffffaa, 0, 0);
    campfire.add(innerFlame);

    // Position the campfire in the center of the ruins platform
    campfire.position.set(0, 0.8, 0); // Positioned on top of the altar

    this.scene.add(campfire);
    return campfire;
  }

  private createTent(): THREE.Group {
    const tent = new THREE.Group();

    // Create tent material
    const tentMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });

    // Create tent shape
    const tentGeometry = new THREE.BufferGeometry();

    // Define tent vertices
    const vertices = new Float32Array([
      // Front triangle
      0,
      0,
      1, // bottom left
      0,
      2,
      0, // top
      0,
      0,
      -1, // bottom right

      // Back triangle
      3,
      0,
      1, // bottom left
      3,
      2,
      0, // top
      3,
      0,
      -1, // bottom right

      // Left side
      0,
      0,
      1, // front bottom
      0,
      2,
      0, // front top
      3,
      2,
      0, // back top
      3,
      0,
      1, // back bottom

      // Right side
      0,
      0,
      -1, // front bottom
      0,
      2,
      0, // front top
      3,
      2,
      0, // back top
      3,
      0,
      -1, // back bottom
    ]);

    // Define indices for triangles
    const indices = new Uint16Array([
      0,
      1,
      2, // front
      3,
      4,
      5, // back
      6,
      7,
      8,
      6,
      8,
      9, // left side
      10,
      11,
      12,
      10,
      12,
      13, // right side
    ]);

    tentGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3),
    );
    tentGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    tentGeometry.computeVertexNormals();

    const tentMesh = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.add(tentMesh);

    // Add tent entrance flap
    const flapGeometry = new THREE.PlaneGeometry(1.5, 2);
    const flap = new THREE.Mesh(flapGeometry, tentMaterial);
    flap.position.set(0.1, 1, 0);
    flap.rotation.y = Math.PI / 6;
    tent.add(flap);

    // Position the tent away from the center
    tent.position.set(-12, 0, 8);
    tent.rotation.y = Math.PI / 4; // Rotate it slightly

    this.scene.add(tent);
    return tent;
  }

  // Getter methods for environment objects
  public getEnvironmentObjects(): EnvironmentObjects {
    return this.environmentObjects;
  }

  // Animation methods
  public updateCampfire(): void {
    // Add campfire animation logic here
    const campfire = this.environmentObjects.campfire;

    // Get all flame objects (cone geometries)
    const flames = campfire.children.filter((child) => {
      const mesh = child as THREE.Mesh;
      return mesh.geometry && mesh.geometry.type === "ConeGeometry";
    });

    // Animate each flame
    flames.forEach((flame) => {
      const flameMesh = flame as THREE.Mesh;
      // Random scale fluctuation
      const scaleFluctuation =
        0.05 * Math.sin(Date.now() * 0.01 * Math.random());
      flameMesh.scale.x = 1 + scaleFluctuation;
      flameMesh.scale.z = 1 + scaleFluctuation;

      // Random height fluctuation
      const heightFluctuation =
        0.1 * Math.sin(Date.now() * 0.005 * Math.random());
      flameMesh.scale.y = 1 + heightFluctuation;

      // Random rotation
      flameMesh.rotation.y += 0.02 * Math.random();
    });

    // Animate the lights
    const lights = campfire.children.filter(
      (child) => child.type === "PointLight",
    );

    lights.forEach((light) => {
      const pointLight = light as THREE.PointLight;
      // Random intensity fluctuation
      const intensityBase = pointLight.position.y > 0.5 ? 3 : 1.5; // Main light or secondary
      const intensityFluctuation = 0.3 * Math.sin(Date.now() * 0.007);
      pointLight.intensity = intensityBase + intensityFluctuation;

      // Random color temperature fluctuation
      const hue = 0.08 + 0.01 * Math.sin(Date.now() * 0.003);
      pointLight.color.setHSL(hue, 1, 0.5);
    });

    // Animate the glowing coals
    const coals = campfire.children.find((child) => {
      const mesh = child as THREE.Mesh;
      return (
        mesh.geometry &&
        mesh.geometry.type === "CircleGeometry" &&
        mesh.material &&
        (mesh.material as THREE.MeshStandardMaterial).emissive &&
        (mesh.material as THREE.MeshStandardMaterial).emissive.r > 0
      );
    });

    if (coals) {
      const coalsMesh = coals as THREE.Mesh;
      const material = coalsMesh.material as THREE.MeshStandardMaterial;
      const emissiveIntensity = 0.5 + 0.2 * Math.sin(Date.now() * 0.004);
      material.emissiveIntensity = emissiveIntensity;
    }
  }

  public updateEnvironment(): void {
    this.updateClouds();
    this.updateCampfire();
  }
}
