# Troubleshooting Guide

## Common Issues and Solutions

### HTTP 404 Error with Vision Models

**Symptom**: Getting "❌ Error: HTTP error! status: 404" when using vision models (Qwen3-VL, LLaVA, etc.) even though LM Studio is running.

**Possible Causes & Solutions**:

#### 1. Model Not Fully Loaded
Even if LM Studio says the model is loaded, vision models can take longer to initialize.

**Solution:**
- Wait 30-60 seconds after loading the model
- Check LM Studio's "Server" tab - should show "Ready" status
- Try sending a test message directly in LM Studio's built-in chat first

#### 2. Server Needs Restart
Sometimes vision models don't register properly with the API server.

**Solution:**
- Stop the LM Studio server (click "Stop Server")
- Wait 5 seconds
- Click "Start Server" again
- Wait for "Running" status
- Try your message again

#### 3. Model Name Mismatch
Some LM Studio configurations require explicitly specifying the model name in API requests.

**Solution:**
Create a `.env` file in the project root with:
```bash
REACT_APP_API_URL=http://localhost:1234
REACT_APP_MODEL_NAME=qwen/qwen3-vl-8b:4
```

Replace the model name with exactly what shows in LM Studio.

After creating the file:
- Restart your development server (Ctrl+C then `npm start` or `npm run electron:dev`)
- Try again

#### 4. LM Studio Version Issue
Older versions of LM Studio may not fully support the vision API.

**Solution:**
- Update LM Studio to the latest version
- Re-download the vision model if needed

#### 5. Try localhost vs 127.0.0.1
Sometimes network resolution can cause issues.

**Solution:**
In your `.env` file, try changing:
```bash
# From:
REACT_APP_API_URL=http://localhost:1234

# To:
REACT_APP_API_URL=http://127.0.0.1:1234
```

Or vice versa.

#### 6. Check LM Studio Logs
LM Studio shows detailed logs that can help identify the issue.

**What to look for:**
- ✅ Good: "Received request: POST to /v1/chat/completions"
- ✅ Good: "Streaming response..." or "Sending response..."
- ❌ Bad: No response after request
- ❌ Bad: Error messages in logs

**If logs show errors:**
- Screenshot the error
- Try reloading the model
- Try a different model to test if the issue is model-specific

### Connection Refused / Network Error

**Symptom**: "Failed to fetch" or "Network error"

**Solutions:**
1. **Check LM Studio is Running**
   - Look for green "Server Running" indicator in LM Studio
   - Verify port 1234 is shown

2. **Check Firewall**
   - Make sure localhost connections are allowed
   - Temporarily disable firewall to test

3. **Check CORS Settings**
   - Open LM Studio Settings
   - Enable "CORS" or "Allow all origins"
   - Restart the server

### File Upload Errors

**Symptom**: PDF or document upload fails

**Solutions:**
1. **Check File Size**: Maximum 50MB per file
2. **Check File Format**: PDF, DOCX, TXT, and code files supported
3. **Check Console**: Press F12 and look for detailed error messages

### Performance Issues

**Symptom**: Slow responses, UI lag

**Solutions:**
1. **Try Smaller Model**: Use 7B instead of 13B/20B
2. **Reduce Max Tokens**: In settings, lower from 2000 to 1000
3. **Close Other Apps**: Free up GPU memory
4. **Check GPU Usage**: Make sure LM Studio is using GPU, not CPU

### Desktop App Won't Start

**Symptom**: Electron app fails to launch

**Solutions:**
1. **Check Build Exists**:
   ```bash
   npm run build
   ```

2. **Try Development Mode First**:
   ```bash
   npm run electron:dev
   ```

3. **Check Console Output**: Look for error messages in terminal

4. **Reinstall Dependencies**:
   ```bash
   npm cache clean --force
   npm install
   ```

## Debug Mode

To get more detailed error information:

1. **Browser Console** (F12):
   - Shows detailed API requests/responses
   - Shows JavaScript errors
   - Check "Console" and "Network" tabs

2. **LM Studio Logs**:
   - Shows server-side errors
   - Shows request details
   - Check the "Server" tab in LM Studio

## Still Having Issues?

If none of these solutions work:

1. **Test in LM Studio First**:
   - Use LM Studio's built-in chat
   - If it works there but not in our UI, it's an API issue
   - If it doesn't work there either, it's a model/LM Studio issue

2. **Try a Different Model**:
   - Load a simple text model (Qwen 7B, Llama 3 8B)
   - If that works, the issue is specific to the vision model

3. **Check Browser Console**:
   - Press F12
   - Look for red errors
   - Screenshot and share if asking for help

4. **Collect Information**:
   - LM Studio version
   - Model being used
   - Browser console errors
   - LM Studio server logs
   - Contents of your `.env` file (if any)

## Quick Checklist for Vision Models

When switching to a vision model:

- [ ] Model fully loaded in LM Studio (not just "loading...")
- [ ] Server started (green "Running" status)
- [ ] Wait 30+ seconds after loading
- [ ] Test in LM Studio's built-in chat first
- [ ] Create `.env` with model name
- [ ] Restart dev server after creating `.env`
- [ ] Check LM Studio logs for errors
- [ ] Try stopping/starting the server
- [ ] Try reloading the model

Most 404 errors with vision models are resolved by restarting the LM Studio server or explicitly setting the model name in `.env`!
