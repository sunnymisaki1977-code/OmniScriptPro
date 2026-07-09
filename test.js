const f = ctx => \A \\; const fStr = f.toString(); const newF = new Function('return (' + fStr + ')')(); console.log(newF({a: 123}));
