function WaveToKML

load waveforms_All


for i=1:length(waveform)
    wave=waveform{i};
    betas=[];
    for k=1:length(wave.station)
        betas=[betas wave.station{k}.betaFactorRaw];
    end
    betamax=max(betas);
    betamin=min(betas);
    betanorm = @(x) (x-betamin)/(betamax-betamin);
    FH=fopen('temp.html','w');
    fprintf(FH,'var stations = {\n');
    for j=1:length(wave.station)
        station=wave.station{j};
        fprintf(FH,'%s: {\n',regexprep(station.name,'[^a-zA-Z0-9]',''));
        fprintf(FH,'center: {lat: %4.4f, lng: %4.4f},\n',station.latitude+randn(1)/100,station.longitude+randn(1)/100);
        fprintf(FH,'beta: %2.4f,\n',station.betaFactorRaw);
        %if(station.betaFactorRaw<0.1),station.betaFactorRaw=0.01; end %Scale negative values
        if(station.betaFactorRaw==0),station.betaFactorRaw=0.001; end %To avoid -Inf, but still outside range for marking purposes
        fprintf(FH,'betaNorm: %2.4f,\n',log10(station.betaFactorRaw));
        fprintf(FH,'betaFactorAverage: "%2.4f",\n',station.betaFactorAverage);
        fprintf(FH,'stationName: "%s"\n',regexprep(station.name,'.*\.([A-Z]+[0-9]+).\d{4}.*','$1'));
        fprintf(FH,'},\n');
    end
    fprintf(FH,'};\n');

    fclose(FH);
    system(sprintf('cat head.html temp.html foot.html > %s.html',wave.name));
    system('rm temp.html');
end

%{
%Estimate the parameters of the parula colormap as simple sinusoidal waves.
Note that the green channel needs the period tripled to give a reasonable
fit
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
fcn = @(b) sum((fit(b,x) - y).^2);                              % Least-Squares cost function
s = fminsearch(fcn, [yr;  per; ym])
plot(x,y);
hold on;
plot(x,s(1)*sin(2*pi*x./s(2))+s(3),'r');
%}
