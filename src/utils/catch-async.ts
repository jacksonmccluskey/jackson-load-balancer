const catchAsync =
	(fn: any) => (req: any, res: any, next: (arg0: any) => any) => {
		Promise.resolve(fn(req, res, next)).catch((err) => next(err));
	};

export default catchAsync;
