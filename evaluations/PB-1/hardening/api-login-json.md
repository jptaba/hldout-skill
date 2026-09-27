
> hldout-skill@1.1.0 heldout
> tsx .claude/skills/heldout-evaluator/scripts/heldout.ts api-probe --key PB-1 GET login/pb1h487730/${env:PB_USER_PASSWORD}

# API probe — GET https://parabank.parasoft.com/parabank/services/bank/login/pb1h487730/$%7Benv:PB_USER_PASSWORD%7D

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · captured 2026-09-27T05:42:20.694Z
- Status: **400**
- Time: 320 ms
- Content-Type: text/html;charset=utf-8

## Response headers (redacted)

```json
{
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4182f3befd2cb6b-EWR",
  "connection": "keep-alive",
  "content-language": "en",
  "content-type": "text/html;charset=utf-8",
  "date": "Sun, 27 Sep 2026 05:42:20 GMT",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "x-content-type-options": "nosniff"
}
```

## Response body (redacted, first 4000 chars)

```json
<!doctype html><html lang="en"><head><title>HTTP Status 400 – Bad Request</title><style type="text/css">body {font-family:Tahoma,Arial,sans-serif;} h1, h2, h3, b {color:white;background-color:#525D76;} h1 {font-size:22px;} h2 {font-size:16px;} h3 {font-size:14px;} p {font-size:12px;} a {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 400 – Bad Request</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Message</b> Invalid character found in the request target [&#47;parabank&#47;services&#47;bank&#47;login&#47;pb1h487730&#47;${env:PB_USER_PASSWORD} ]. The valid characters are defined in RFC 7230 and RFC 3986</p><p><b>Description</b> The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).</p><p><b>Exception</b></p><pre>java.lang.IllegalArgumentException: Invalid character found in the request target [&#47;parabank&#47;services&#47;bank&#47;login&#47;pb1h487730&#47;${env:PB_USER_PASSWORD} ]. The valid characters are defined in RFC 7230 and RFC 3986
	org.apache.coyote.http11.Http11InputBuffer.parseRequestLine(Http11InputBuffer.java:481)
	org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:279)
	org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:71)
	org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:1307)
	org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:2201)
	org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:74)
	org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:949)
	org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:483)
	org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:74)
	java.base&#47;java.lang.Thread.run(Unknown Source)
</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/11.0.26</h3></body></html>
```

