export const trimOuterShell = (faces: number[][]) =>
  // filter the faces
  faces.filter((face) =>
    // keep it if
    // every of its edge
    // are common with some other face
    face.every((_, u) => {
      const edge = [face[u], face[(u + 1) % face.length]].sort();

      return faces.some(
        (face2) =>
          face !== face2 &&
          face2.some((_, u2) => {
            const edge2 = [face2[u2], face2[(u2 + 1) % face2.length]].sort();

            return edge[0] === edge2[0] && edge[1] === edge2[1];
          })
      );
    })
  );
