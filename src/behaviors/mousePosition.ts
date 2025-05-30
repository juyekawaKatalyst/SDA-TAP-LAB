import { type Viewer } from "orbpro";
import { mousePosition } from "@/stores/mouseposition.store";
let mousePosListener: any = null;
//@ts-ignore
import { Cartesian3, Math } from "orbpro";

export const addMousePosListener = (viewer: Viewer) => {

    mousePosListener = function (e: any) {
        var ellipsoid = viewer.scene.globe.ellipsoid;
        // Mouse over the globe to see the cartographic position 
        var cartesian = viewer.camera.pickEllipsoid(new Cartesian3(e.clientX, e.clientY), ellipsoid);

        if (cartesian) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            mousePosition.set({
                longitude: Math.toDegrees(cartographic.longitude),
                latitude: Math.toDegrees(cartographic.latitude),
                height: cartographic.height,
                cartesian
            });
        }

    };
    let tr = viewer.scene.canvas.addEventListener('mousemove', mousePosListener);
}

export const removeMousePosListener = (viewer: Viewer) => {
    viewer.scene.canvas.removeEventListener('mousemove', mousePosListener);
}

