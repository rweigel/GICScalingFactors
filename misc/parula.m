% Estimate the parameters of the parula colormap as simple sinusoidal waves.
% Note that the green channel needs the period tripled to give a reasonable
% fit
colors=parula(256);
x=1:256;
y=colors(:,2)';
yu = max(y);
yl = min(y);
yr = (yu-yl);                               % Range of ‘y’
yz = y-yu+(yr/2);
zx = x(yz .* circshift(yz,[0 1]) <= 0);     % Find zero-crossings
per = 2*mean(diff(zx));                     % Estimate period
ym = mean(y);                               % Estimate offset

fit = @(b,x)  b(1).*(sin(2*pi*x./b(2))) + b(3);    % Function to fit
fcn = @(b) sum((fit(b,x) - y).^2);                 % Least-Squares cost function
s = fminsearch(fcn, [yr;  per; ym])
plot(x,y);
hold on;
plot(x,s(1)*sin(2*pi*x./s(2))+s(3),'r');