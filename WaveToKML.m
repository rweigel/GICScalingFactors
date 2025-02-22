
function WaveToKML

load data/waveforms_All_2025

for i=1:length(waveform)
    wave = waveform{i};
    betas = [];
    for k=1:length(wave.station)
        betas = [betas wave.station{k}.betaFactorRaw];
    end
    betamax = max(betas);
    betamin = min(betas);
    betanorm = @(x) (x-betamin)/(betamax-betamin);

    % Read head.html and replace all occurrences of {{TITLE}} with the
    % magnetometer three-letter code
    template_file = fileread('html/template.html');
    template = strrep(template_file, '{{TITLE}}', wave.name(1:3));

    fname_js = sprintf('data/%s.js', wave.name(1:3));
    FH = fopen(fname_js,'w');
    fprintf(FH,'var STATIONS = {\n');

    % TODO: Put info in struct and use jsonencode. Note that jsonenconde
    % by default uses strings for all values, so will need to handle.
    % TODO: Compute log in web app.
    for j=1:length(wave.station)
        station = wave.station{j};
        station_name = regexprep(station.name,'[^a-zA-Z0-9]','');

        fprintf(FH,'%s: {\n',station_name);
        fprintf(FH,'center: {lat: %4.4f, lng: %4.4f},\n',station.latitude+randn(1)/100,station.longitude+randn(1)/100);
        if (station.betaFactorRaw == 0)
            % To avoid -Inf, but still outside range for marking purposes
            station.betaFactorRaw=0.0001;
            station.betaFactorAverage=0.0001;
        end
        fprintf(FH,'betaFactorRaw: %2.2f,\n',station.betaFactorRaw);
        fprintf(FH,'betaFactorRawNorm: %2.2f,\n',log10(station.betaFactorRaw));
        fprintf(FH,'betaFactorAverage: %2.2f,\n',station.betaFactorAverage);
        fprintf(FH,'betaFactorAverageNorm: %2.2f,\n',log10(station.betaFactorAverage));
        fprintf(FH,'QF: %d,\n',station.QF);
        fprintf(FH,'stationName: "%s"\n',regexprep(station.name,'.*\.([A-Z]+[0-9]+).\d{4}.*','$1'));
        fprintf(FH,'},\n');
    end
    fprintf(FH,'};\n');
    fclose(FH);

    fname_html = sprintf('%s.html', wave.name(1:3));
    fid = fopen(fname_html, 'w');
    fwrite(fid, template);

    fclose(fid);
end
