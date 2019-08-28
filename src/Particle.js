import { Vector3 } from 'three';

const speedLimit = 1;

export default function Particle(position = new Vector3(0, 0, 0)) {
    this.position = position;
    this.velocity = new Vector3(0, 0, 0);
    this.birth = Date.now();
    this.lifetime = Math.random() * 1000 + 500; // in ms
    this.attractors = [];
}

Particle.prototype = {
    addAttractor(attractor) {
        this.attractors.push(attractor);
    },
    removeAttractor(attractor) {
        this.attractors = this.attractors.filter(attr => attr !== attractor);
    },
    updatePosition() {
        // compute velocity change from attractors
        const offset = new Vector3(0, 0, 0);
        this.attractors.forEach(attractor => {
            const attraction = attractor(this.position, this.velocity).clampLength(-speedLimit, speedLimit);
            offset.add(attraction);
        });
        this.velocity.add(offset);

        this.position.add(this.velocity);
    },
    revive(newPosition) {
        this.birth = Date.now();
        this.velocity = new Vector3(0, 0, 0);
        this.position.copy(newPosition);
    },
    isDead() {
        return Date.now() > this.birth + this.lifetime;
    }
}