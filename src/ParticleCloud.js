import { 
    BufferGeometry, 
    BufferAttribute, 
    Points, 
    PointsMaterial,
    TextureLoader,
    Mesh,
    MeshPhongMaterial,
    Color,
    MeshBasicMaterial,
    TetrahedronGeometry,
    DoubleSide
} from 'three';

const pointSize = 0.2;

export default function ParticleCloud(numParticles) {
    this.vertices = new Float32Array(numParticles * 9).fill(0);
    this.geom = new BufferGeometry();
    this.positionBuffer = new BufferAttribute(this.vertices, 3);
    // const texture = new TextureLoader().load(require('../assets/sprite.png'));
    this.material = new MeshBasicMaterial({
        color: new Color('#ffffff'),
        side: DoubleSide
    });
    // this.material.emissive = new Color(0xffffff);

    this.geom.addAttribute('position', this.positionBuffer);

    this.points = new Mesh(this.geom, this.material);
    this.points.castShadow = true;

    this.particles = [];
}

ParticleCloud.prototype = {
    addParticle(particle) {
        this.particles.push(particle);
    },
    updatePositions() {
        this.particles.forEach(particle => particle.updatePosition());
        const positions = this.particles.map(particle => {
            const { x, y, z } = particle.position;
            return [
                x - pointSize, y, z,
                x + pointSize, y, z,
                x, y + pointSize, z
            ];
        }).flat();

        const arr = this.geom.attributes.position.array;
        for (let i = 0; i < arr.length; i++) {
            arr[i] = positions[i];
        }
        this.material.needsUpdate = true;
        this.geom.attributes.position.needsUpdate = true;
        this.geom.computeBoundingSphere();
    },
    // param attractor: function that takes Vector3 and returns Vector3
    addAttractor(attractor) {
        this.particles.forEach(particle => {
            particle.addAttractor(attractor);
        })
    },
    setPosition(position) {
        this.points.position.copy(position);
    }
}