import { PluginObj, NodePath } from "@babel/core";
import t_, { FunctionDeclaration, FunctionExpression } from "@babel/types";

const arrowable = (
  p: NodePath<FunctionDeclaration> | NodePath<FunctionExpression>
) => {
  let res = true;
  p.traverse({
    ThisExpression: () => {
      res = false;
    },
    Identifier: (path) => {
      if (path.node.name === "arguments") res = false;
    },
  });

  return res;
};

const createPlugin = ({ types: t }: { types: typeof t_ }) => {
  const p: PluginObj = {
    visitor: {
      FunctionDeclaration: (path) => {
        if (!arrowable(path)) return;

        const id = path.node.id!;
        const arrowFunction = t.arrowFunctionExpression(
          path.node.params,
          path.node.body
        );

        path.replaceWith(
          t.variableDeclaration("var", [
            t.variableDeclarator(id, arrowFunction),
          ])
        );
      },

      FunctionExpression: (path) => {
        if (!arrowable(path)) return;

        const arrowFunction = t.arrowFunctionExpression(
          path.node.params,
          path.node.body
        );

        path.replaceWith(arrowFunction);
      },
    },
  };

  return p;
};

export default createPlugin;
