
export class Notifiable<T> extends Set {

	constructor() {
		super();
	}

	notify(data?: T) {
		this.forEach(listenerFn => listenerFn(data));
	}

	subscribe(listenerFn: (value?: T) => void): () => void {
		this.add(listenerFn);
		return () => this.delete(listenerFn);
	}
}

export class Observable<T> extends Notifiable<T> {

	protected _value: T;

	constructor(initialValue: T) {
		super();
		this._value = initialValue;
	}

	notify() {
		this.forEach(listenerFn => listenerFn(this._value));
	}

	subscribe(listenerFn: (value: T) => void): () => void {
		this.add(listenerFn);
		return () => this.delete(listenerFn);
	}

	set(newValue: T, notifyListeners = true) {
		if (newValue !== this._value) {
			this._value = newValue;
			notifyListeners && this.notify();
		}
	}

	update(updaterFn: (oldValue: T) => T, notifyListeners = true) {
		this.set(updaterFn(this._value), notifyListeners);
	}

	get(): T {
		return this._value;
	}

	get value(): T {
		return this.get();
	}

	set value(newValue) {
		this.set(newValue);
	}
}

export class Computed<T> extends Observable<T> {

	constructor(valueFn: () => T, dependencies: Observable<any>[]|Set<Observable<any>> = []) {
		super(valueFn());

		const listenerFn = () => {
			this._value = valueFn();
			this.notify();
		}

		dependencies.forEach(dep => {
			dep.subscribe(listenerFn);
		});
	}

	set value(_:any) {
		throw "🚨 Cannot set computed property";
	}

	update(_:any) {
		throw "🚨 Cannot set computed property";
	}

	set(_:any) {
		throw "🚨 Cannot set computed property";
	}
}
